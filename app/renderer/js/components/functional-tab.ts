import Tab, { TabProps } from './tab';

export default class FunctionalTab extends Tab {
	$closeButton: Element;
	template(): string {
		return `<div class="tab functional-tab" data-tab-id="${this.props.tabIndex}">
					<div class="server-tab-badge close-button">
						<i class="material-icons">close</i>
					</div>
					<div class="server-tab">
						<i class="material-icons">${this.props.materialIcon}</i>
					</div>
				</div>`;
	}

	constructor(props: TabProps) {
		super(props);
		this.init();
	}

	init(): void {
		this.$el = this.generateNodeFromTemplate(this.template());
		if (this.props.name !== 'Settings') {
			this.props.$root.append(this.$el);
			this.$closeButton = this.$el.querySelectorAll('.server-tab-badge')[0];
			this.registerListeners();
		}
	}

	registerListeners(): void {
		super.registerListeners();

		this.$el.addEventListener('mouseover', () => {
			this.$closeButton.classList.add('active');
		});

		this.$el.addEventListener('mouseout', () => {
			this.$closeButton.classList.remove('active');
		});

		this.$closeButton.addEventListener('click', (event: Event) => {
			this.props.onDestroy();
			event.stopPropagation();
		});
	}
}
