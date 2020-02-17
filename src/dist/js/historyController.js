import uuidv1 from 'uuid/v1';

export default class HistoryController {
	constructor(config) {
		this.xhr = new XMLHttpRequest();
		this.list = [];
		this.history = [];
		this.listController = config.listController;
		this.popupController = config.popupController;
		this.currentId = null;

		this.initialize();
	}

	initialize() {
		this.xhr.open('GET', '/history');

		this.xhr.onload = () => {
			if (this.xhr.status === 200) {
				this.list = JSON.parse(this.xhr.responseText).history;
				let parameter = this.getParameter();

				if (parameter) {
					this.currentId = parameter;

					// Set history steps by current GET parameter
					this.setHistory(parameter);

					// Initialize current application state
					this.setState(parameter);
				}

				// Watch previous/next browser buttons
				window.addEventListener('popstate', () => {
					parameter = this.getParameter();
					const event = this.getButtonEvent(parameter);

					if (event !== 'start') {
						// Initialize event (created/updated/deleted)
						this.setEvent({parameter, event});

						// Initialize state (create/update/delete/cancel)
						this.setState(parameter);
					}
				})
			} else {
				alert(`Request failed. Returned status of ${xhr.status}`);
			}
		};

		this.xhr.send();
	}

	setHistory(parameter) {
		// Find current state
		const state = this.list.find(item => item.id === parameter);

		// Add this state to local history
		this.history = [...this.history, state];

		// If this state has previous ID recall this method with previous parameter
		if (state.prevId) {
			return this.setHistory(state.prevId);
		}

		// When we have all history, add first step with action 'cancel', and reverse history
		this.history = [{action: 'cancel', id: 0}, ...this.history.reverse()];

		// Push local history to browser history
		this.history.forEach(item => {
			window.history.pushState('1', 'Title', `?history=${item.id}`);
		});
	}

	setEvent({parameter, event = 'previous'}) {
		let state;

		this.history.forEach((item, index) => {
			// Find true state
			if (item.id === parameter) {
				if (event === 'previous') {
					state = this.history[index + 1];
				} else {
					state = this.history[index];
				}
			}
		});

		switch(state && state.action) {
			case 'created':
				if (event === 'previous') {
					// If action is 'created' and step previous, set active created item and remove it
					this.listController.setActive({data: state.data, force: true});
					this.listController.delete();
				} else {

					// If step next, create item
					this.listController.create({data: state.data});
				}
				break;
			case 'updated':
				if (event === 'previous') {
					// If action is 'updated' and step previous, set active updated item and revert changes
					this.listController.setActive({data: state.data, force: true});
					this.listController.update(state.data);
				} else {
					// If step next, add changes and hide popup
					this.listController.update(state.updated);
					this.popupController.hide();
				}
				break;
			case 'deleted':
				if (event === 'previous') {
					// If action is 'deleted' and step previous, revert deleted item
					this.listController.create({data: state.data, position: state.position});
				} else {
					// If step next, set active, delete item and hide popup
					this.listController.setActive({data: state.data, force: true});
					this.listController.delete();
					this.popupController.hide();
				}
				break;
			default:
				console.log('historyController/setEvent: no action');
				break
		}
	}

	setState(parameter) {
		// Find current state
		const state = this.history.find(item => item.id === parameter);

		switch(state && state.action) {
			case 'create':
				const list = this.listController.list;
				const id = Number(list[list.length - 1].id) + 1;

				this.popupController.show({
					data: {id},
					confirmText: 'Создать',
					events: {
						onConfirm: data => {
							this.downgradeHistory();

							this.listController.create({data});

							this.push({
								action: 'created',
								data
							});
						},
						onCancel: () => {
							this.downgradeHistory();

							this.push({
								action: 'cancel'
							});
						}
					}
				});
				break;
			case 'update':
				this.listController.setActive({ data: state.data, force: true});

				this.popupController.show({
					data: state.data,
					confirmText: 'Обновить',
					events: {
						onConfirm: updated => {
							this.downgradeHistory();

							this.listController.update(updated);

							this.push({
								action: 'updated',
								data: state.data,
								updated
							});
						},
						onCancel: () => {
							this.downgradeHistory();

							this.push({
								action: 'cancel'
							});
						}
					}
				});
				break;
			case 'delete':
				this.popupController.show({
					text: `Вы действительно хотите удалить ${state.data.id}?`,
					confirmText: 'Удалить',
					events: {
						onConfirm: () => {
							this.downgradeHistory();

							let position = 0;

							this.listController.list.forEach((item, index) => {
								if (Number(item.id) === Number(state.data.id)) {
									position = index;
								}
							});

							this.listController.delete();

							this.push({
								action: 'deleted',
								data: state.data,
								position
							});
						},
						onCancel: () => {
							this.downgradeHistory();

							this.push({
								action: 'cancel'
							});
						}
					}
				});
				break;
			case 'cancel':
				this.popupController.hide();
				break;
			default:
				this.popupController.hide();
				break
		}
	}

	downgradeHistory() {
		// When we
		this.currentId = this.history[this.history.length - 1].id;
		this.history = this.history.slice(0, this.history.length - 1);
	}

	getButtonEvent(parameter) {
		let current = 0;
		let next = 0;

		this.history.forEach((item, index) => {
			if (item.id === parameter) {
				next = index + 1;
			}

			if (item.id === this.currentId) {
				current = index + 1;
			}
		});

		this.currentId = parameter;

		if (current < 2 && next > 2) {
			return 'start'
		}

		return current < next ? 'next' : 'previous'
	}

	getParameter() {
		const data = {};
		const parameters = window.location.search.substring(1).split('&');

		parameters.forEach(parameter => {
			const values = parameter.split('=');

			data[values[0]] = values[1];
		});

		if (data.history) {
			return data.history
		}

		return '';
	}

	push(config) {
		const currentId = this.getParameter();

		if (currentId) {
			config.prevId = currentId;
		}

		config.id = uuidv1();

		this.xhr.open('POST', '/history');
		this.xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

		this.xhr.onload = () => {
			if (this.xhr.status === 200) {
				this.history = [...this.history, config];
				this.currentId = config.id;

				window.history.pushState('1', 'Title', `?history=${config.id}`);
			} else {
				alert(`Request failed. Returned status of ${xhr.status}`);
			}
		};

		this.xhr.send(JSON.stringify(config));
	}
}
