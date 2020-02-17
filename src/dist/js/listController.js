export default class ListController {
	constructor(config) {
		this.xhr = new XMLHttpRequest();
		this.DOMContent = config.DOMContent;
		this.DOMCount = config.DOMCount;
		this.list = [];
		this.active = null;
		this.onChangeActive = value => config.onChangeActive(value);

		this.get();
	}

	// Get list from database and set him to DOM
	get() {
		this.xhr.open('GET', '/products');

		this.xhr.onload = () => {
			if (this.xhr.status === 200) {
				// Set response to list
				this.list = JSON.parse(this.xhr.responseText);

				if (this.list.products && this.list.products.length) {
					// Set products from response to list
					this.list = this.list.products;

					// Set result to DOM
					this._appendFields();
				}
			} else {
				alert(`Request failed. Returned status of ${xhr.status}`);
			}
		};

		this.xhr.send();
	}

	// Create item
	create({data, position = null}) {
		this.xhr.open('POST', '/products');
		this.xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

		this.xhr.onload = () => {
			if (this.xhr.status === 200) {
				// Create DOM item
				const dom = this._createItem(data);

				if (position === null || position === this.list.length) {
					// Add new data to list
					this.list = [...this.list, data];

					// Add new item to DOM
					this.DOMContent.appendChild(dom);

					// Scroll to last item
					this.DOMContent.scrollTop = this.DOMContent.scrollHeight;
				} else {
					// Add new data to list
					this.list.splice( position, 0, data );

					// Add new item to DOM
					this.DOMContent.insertBefore(dom, this.DOMContent.children[position]);

					// Scroll to last item
					this.DOMContent.scrollTop = dom.offsetTop - 200;
				}

				// Set active new item
				this.setActive({data, dom});
			} else {
				alert(`Request failed. Returned status of ${xhr.status}`);
			}
		};

		this.xhr.send(JSON.stringify(data));

		this._setCount();
	}

	// Update item
	update(data) {
		this.xhr.open('PUT', `/products/${this.active.data.id}`);
		this.xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

		this.xhr.onload = () => {
			if (this.xhr.status === 200) {
				// Set to configuration new data
				this.active.data = data;

				// Update list
				this.list = this.list.map(item => {
					if (item.id === data.id) {
						return data
					}

					return item
				});

				// Remove child from item
				this.active.dom.innerHTML = '';

				// Add updated child to item
				Object.keys(data).forEach(name => {
					this.active.dom.appendChild(this._createField({type: name, text: data[name]}));
				});
			} else {
				alert(`Request failed. Returned status of ${xhr.status}`);
			}
		};

		this.xhr.send(JSON.stringify(data));
	}

	// Remove item
	delete() {
		if (this.active) {
			this.xhr.open('DELETE', `/products/${this.active.data.id}`);

			this.xhr.onload = () => {
				if (this.xhr.status === 200) {
					// Remove item from DOM
					this.active.dom.remove();

					// Remove from list current item
					this.list = this.list.filter(({id}) => id !== this.active.data.id);

					// Reset active configuration
					this.active = null;

					// Disable update/remove buttons, because no active item
					this.onChangeActive(true);

					// Update counter
					this._setCount();
				} else {
					alert(`Request failed. Returned status of ${xhr.status}`);
				}
			};

			this.xhr.send();
		}
	}

	// Set active item
	setActive({data, dom, force = false}) {
		// If list has active item, remove active condition
		if (this.active) {
			this.active.dom.classList.remove('active');
		}

		// If list has active item and this item is current, don't add new active item
		if (!force && this.active && this.active.data.id === data.id) {
			// Reset active configuration
			this.active = null;

			// Disable update/remove buttons, because no active item
			this.onChangeActive(true);

			return false
		}

		// set DOM item if dom is undefined
		if (!dom) {
			dom = document.querySelector(`[data-id="${data.id}"]`);
		}

		// Add active condition for current item
		dom.classList.add('active');

		// Put new active configuration
		this.active = {
			data,
			dom
		};

		// Enable update/remove buttons
		this.onChangeActive(false);
	}

	// Add items count to DOM
	_setCount() {
		this.DOMCount.innerHTML = String(this.list.length);
	}

	// Append list to DOM
	_appendFields() {
		// Remove old list from DOM
		this.DOMContent.innerHTML = '';

		// Add current list to DOM
		this.list.forEach(item => {
			const dom = this._createItem(item);

			this.DOMContent.appendChild(dom);
		});

		this._setCount();
	}

	// Get item HTML
	_createItem(data) {
		const dom = document.createElement('div');

		dom.setAttribute('data-id', data.id);
		dom.classList.add('item');
		dom.onclick = () => this.setActive({data, dom});

		// Add fields to item
		Object.keys(data).forEach(name => {
			dom.appendChild(this._createField({type: name, text: data[name]}));
		});

		return dom
	}

	// Get field HTML
	_createField({type, text}) {
		const field = document.createElement('span');

		field.classList.add('field');
		field.classList.add(type);
		field.innerHTML = text || '-';

		return field
	}
}
