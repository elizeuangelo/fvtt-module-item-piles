import dnd5e from "./systems/dnd5e.js";

// This fork only supports D&D 5e 3.x, from the 3.2.0 attunement data changes onwards
const DND5E_MINIMUM_VERSION = "3.2.0";
const DND5E_UNSUPPORTED_VERSION = "4.0.0";

export const SYSTEMS = {

	DEFAULT_SETTINGS: {
		VERSION: "",
		ACTOR_CLASS_TYPE: "",
		ITEM_CLASS_LOOT_TYPE: "",
		ITEM_CLASS_WEAPON_TYPE: "",
		ITEM_CLASS_EQUIPMENT_TYPE: "",
		ITEM_QUANTITY_ATTRIBUTE: "",
		ITEM_PRICE_ATTRIBUTE: "",
		ITEM_PREVIEW_PERMISSION_LEVEL: 1,
		QUANTITY_FOR_PRICE_ATTRIBUTE: "flags.item-piles.system.quantityForPrice",
		ITEM_FILTERS: [],
		ITEM_SIMILARITIES: ["name", "type"],
		UNSTACKABLE_ITEM_TYPES: [],
		PILE_DEFAULTS: {},
		TOKEN_FLAG_DEFAULTS: {},
		ITEM_TRANSFORMER: null,
		PREVIEW_ITEM_TRANSFORMER: null,
		PRICE_MODIFIER_TRANSFORMER: null,
		ITEM_COST_TRANSFORMER: null,
		SYSTEM_HOOKS: null,
		SHEET_OVERRIDES: null,
		CURRENCIES: [],
		SECONDARY_CURRENCIES: [],
		CURRENCY_DECIMAL_DIGITS: 0.00001,
		VAULT_STYLES: [],
		CSS_VARIABLES: [],
		SOFT_MIGRATIONS: {},
		ITEM_TYPE_HANDLERS: {},
	},

	get HAS_SYSTEM_SUPPORT() {
		if (game.system.id !== "dnd5e") return false;
		const version = game.system.version;
		return !foundry.utils.isNewerVersion(DND5E_MINIMUM_VERSION, version)
			&& foundry.utils.isNewerVersion(DND5E_UNSUPPORTED_VERSION, version);
	},

	_currentSystem: false,

	get DATA() {

		if (this._currentSystem) return this._currentSystem;

		if (!this.HAS_SYSTEM_SUPPORT) return this.DEFAULT_SETTINGS;

		this._currentSystem = foundry.utils.mergeObject(this.DEFAULT_SETTINGS, dnd5e);

		return this._currentSystem;
	}
};
