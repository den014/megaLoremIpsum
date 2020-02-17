export default class PopupController {
	constructor() {
		this.popup = null;
		this.form = null;
		this.notification = null;
		this.fields = {
			id: null,
			name: null,
			version: null,
			city: null,
			color: null,
			company: null
		};
		this.events = {
			onConfirm: () => {},
			onCancel: () => {}
		};
		this.confirmButton = null;
		this.cancelButton = null;

		this._createDOM();

		document.addEventListener('keydown', e => {
			if (e.key === 'Escape' && this.popup.classList.contains('visible')) {
				this.hide();
			}
		})
	}

	show(config) {
		if (config.data) {
			const fieldsArray = Object.keys(config.data);

			fieldsArray.forEach(type => {
				this.fields[type].value = config.data[type]
			});

			this.form.classList.add('visible');
		} else {
			this.notification.classList.add('visible');
			this.notification.innerText = config.text || 'Вы действительно хотите совершить данное действие?'
		}

		if (config.events) {
			this.events = config.events;
		}

		this.confirmButton.innerText = config.confirmText;

		this.popup.classList.add('visible');

		if (this.events.onShow) {
			this.events.onShow();
		}
	}

	hide() {
		// Reset all configuration and hide popup
		this.popup.classList.remove('visible');

		this.events = {
			onShow: () => {},
			onConfirm: () => {},
			onCancel: () => {},
		};

		setTimeout(() => {
			this.form.classList.remove('visible');
			this.notification.classList.remove('visible');

			Object.keys(this.fields).forEach(type => {
				this.fields[type].value = '';
			});

			this.confirmButton.innerHTML = '';
		}, 300);
	}

	_confirm() {
		const data = {};

		Object.keys(this.fields).forEach(type => {
			data[type] = this.fields[type].value || null;
		});

		if (this.events.onConfirm) {
			this.events.onConfirm(data);
		}

		this.hide();
	}

	_cancel() {
		if (this.events.onCancel) {
			this.events.onCancel();
		}

		this.hide();
	}

	_createDOM() {
		// Create DOM elements
		this.popup = document.createElement('aside');
		this.form = document.createElement('section');
		this.notification = document.createElement('section');
		this.confirmButton = document.createElement('button');
		this.cancelButton = document.createElement('button');
		const overlay = document.createElement('button');
		const container = document.createElement('section');
		const closeButton = document.createElement('button');
		const control = document.createElement('section');

		// Add classes
		this.popup.classList.add('popup');
		this.form.classList.add('form');
		this.notification.classList.add('notification');
		this.confirmButton.classList.add('button');
		this.cancelButton.classList.add('button');
		overlay.className = 'overlay button-cancel';
		container.classList.add('container');
		closeButton.className = 'close button-cancel';
		control.classList.add('control');

		// Create DOM structure popup window
		this.popup.append(overlay, container);
		container.append(closeButton, this.form, this.notification, control);
		control.append(this.confirmButton, this.cancelButton);

		Object.keys(this.fields).forEach(type => {
			this.form.appendChild(this._createField({type}));
		});

		// Add text for cancel button
		this.cancelButton.innerText = 'Отмена';

		// Add click event for buttons
		this.confirmButton.onclick = () => this._confirm();
		this.cancelButton.onclick = () => this._cancel();
		overlay.onclick = () => this._cancel();
		closeButton.onclick = () => this._cancel();

		// Put structure to DOM
		document.querySelector('#root').prepend(this.popup);
	}

	_createField({type}) {
		const field = document.createElement('div');
		const input = document.createElement('input');

		input.classList.add('input');
		input.placeholder = type;

		field.classList.add('field');
		field.classList.add(type);
		field.appendChild(input);

		this.fields[type] = input;

		if (type === 'id') {
			input.readOnly = true;
		}

		return field;
	}
}
