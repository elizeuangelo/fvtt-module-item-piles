import * as Helpers from "../helpers/helpers.js";
import * as Utilities from "../helpers/utilities.js";
import * as PileUtilities from "../helpers/pile-utilities.js";
import SETTINGS from "../constants/settings.js";
import PrivateAPI from "../API/private-api.js";
import ChatAPI from "../API/chat-api.js";
import DropItemDialog from "../applications/dialogs/drop-item-dialog/drop-item-dialog.js";
import { hotkeyActionState } from "../hotkeys.js";

let transferInProgress = false;

/**
 * Turns dragging an item from one owned actor's sheet onto another owned actor or container into a transfer,
 * instead of the default copy.
 */
export function registerSheetTransfers() {
	Hooks.on("dropActorSheetData", (actor, sheet, data) => onDrop(actor, data));
	Hooks.on("dnd5e.dropItemSheetData", (item, sheet, data) => {
		// Other item sheets receive drops for advancements and effects
		if (item.type !== "container" || !(item.parent instanceof Actor)) return;
		return onDrop(item.parent, data, item);
	});
}

/**
 * Starts a transfer when the dropped item qualifies, returning false so the sheet doesn't also copy it.
 *
 * @param {Actor} targetActor
 * @param {object} data                 The drop data
 * @param {Item|null} [container=null]  The container the item was dropped onto, if any
 * @returns {boolean|void}
 */
function onDrop(targetActor, data, container = null) {
	if (data.type !== "Item" || !data.uuid) return;
	if (Helpers.getSetting(SETTINGS.SHEET_ITEM_DROP) !== SETTINGS.SHEET_ITEM_DROP_OPTIONS.TRANSFER) return;
	const item = fromUuidSync(data.uuid);
	if (!canTransfer(item, targetActor)) return;
	if (transferInProgress) {
		Helpers.custom_warning(game.i18n.localize("ITEM-PILES.Warnings.SheetTransferInProgress"), true);
		return false;
	}
	// Read the hotkey now, it may be released by the time the transfer gets to it
	transfer(item, targetActor, container, { onlyOne: hotkeyActionState.forceDropOneItem });
	return false;
}

function canTransfer(item, targetActor) {
	if (!(item instanceof Item)) return false;
	const sourceActor = item.parent;
	if (!(sourceActor instanceof Actor) || sourceActor.pack || targetActor.pack) return false;
	if (sourceActor.uuid === targetActor.uuid) return false;
	if (!sourceActor.isOwner || !targetActor.isOwner) return false;
	// Items can be dragged out of regular piles and containers, while dropping into any pile, or taking from
	// merchants, vaults and the like, goes through Item Piles' own interfaces
	if (PileUtilities.isValidItemPile(targetActor)) return false;
	if (PileUtilities.isValidItemPile(sourceActor) && !PileUtilities.isItemPileLootable(sourceActor)) return false;
	return Utilities.hasItemQuantity(item)
		&& Utilities.getItemQuantity(item) > 0
		&& !PileUtilities.isItemInvalid(targetActor, item);
}

async function transfer(item, targetActor, container, { onlyOne = false } = {}) {

	transferInProgress = true;
	const sourceActor = item.parent;

	try {

		let quantity = Utilities.getItemQuantity(item);
		if (quantity > 1 && PileUtilities.canItemStack(item, targetActor)) {
			quantity = onlyOne
				? 1
				: Number(await DropItemDialog.show(item, targetActor, { localizationTitle: "GiveItem" }));
			if (!quantity) return;
		}

		// The item may have been used, moved or deleted while the dialog was open
		const currentItem = sourceActor.items.get(item.id);
		if (!currentItem || Utilities.getItemQuantity(currentItem) < quantity) {
			Helpers.custom_warning(game.i18n.format("ITEM-PILES.Warnings.SheetTransferSourceChanged", {
				item_name: item.name,
				source_name: sourceActor.name
			}), true);
			return;
		}

		let result;
		try {
			result = await PrivateAPI._transferSheetItem(sourceActor, targetActor, currentItem, quantity, {
				containerId: container?.id ?? null
			});
		} catch (err) {
			Helpers.custom_warning(game.i18n.format("ITEM-PILES.Warnings.SheetTransferFailed", { item_name: item.name }), true);
			console.error(err);
			return;
		}
		if (!result) return;

		if (result.error) {
			Helpers.custom_warning(game.i18n.format("ITEM-PILES.Warnings.SheetTransferDuplicated", {
				item_name: item.name,
				source_name: sourceActor.name,
				target_name: targetActor.name
			}), true);
			console.error(result.error);
			return ChatAPI._outputSheetTransferDuplicated(sourceActor, targetActor, result.items);
		}

		return ChatAPI._outputSheetTransfer(sourceActor, targetActor, result.items);

	} finally {
		transferInProgress = false;
	}

}
