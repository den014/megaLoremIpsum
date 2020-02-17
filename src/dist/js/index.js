import '../scss/index.scss';

import ListController from './listController';
import PopupController from './popupController';
import HistoryController from './historyController';

(async () => {
	const DOMContent = document.querySelector('.list-container');
	const DOMCount = document.querySelector('.items-count');
	const DOMAddButton = document.querySelector('.button-add');
	const DOMUpdateButton = document.querySelector('.button-update');
	const DOMRemoveButton = document.querySelector('.button-remove');

	// Initialize ListController
	const listController = await new ListController({
		DOMContent,
		DOMCount,
		onChangeActive: value => {
			if (DOMUpdateButton.disabled !== value) {
				DOMUpdateButton.disabled = value;
				DOMRemoveButton.disabled = value;
			}
		}
	});

	const popupController = new PopupController();

	const historyController = new HistoryController({
		listController,
		popupController
	});

	DOMAddButton.addEventListener('click', () => {
		const list = listController.list;
		const id = Number(list[list.length - 1].id) + 1;

		popupController.show({
			data: {id},
			confirmText: 'Создать',
			events: {
				onShow: () => historyController.push({
					action: 'create'
				}),
				onConfirm: data => {
					listController.create({data});

					historyController.push({
						action: 'created',
						data
					});
				},
				onCancel: () => {
					historyController.push({
						action: 'cancel'
					});
				}
			}
		});
	});

	DOMUpdateButton.addEventListener('click', () => {
		const {data} = listController.active;

		popupController.show({
			data: data,
			confirmText: 'Обновить',
			events: {
				onShow: () => historyController.push({
					action: 'update',
					data
				}),
				onConfirm: updated => {
					listController.update(updated);

					historyController.push({
						action: 'updated',
						data,
						updated
					});
				},
				onCancel: () => {
					historyController.push({
						action: 'cancel'
					});
				}
			}
		});
	});

	DOMRemoveButton.addEventListener('click', () => {
		const {data} = listController.active;

		popupController.show({
			text: `Вы действительно хотите удалить ${data.id}?`,
			confirmText: 'Удалить',
			events: {
				onShow: () => historyController.push({
					action: 'delete',
					data
				}),
				onConfirm: () => {
					let position = 0;

					listController.list.forEach((item, index) => {
						if (item.id === Number(data.id)) {
							position = index;
						}
					});

					listController.delete();

					historyController.push({
						action: 'deleted',
						data,
						position
					});
				},
				onCancel: () => {
					historyController.push({
						action: 'cancel'
					});
				}
			}
		});
	});
})();
