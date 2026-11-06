<script>

	import { localize } from '#runtime/util/i18n';
	import ListEntry from "./ListEntry.svelte";

	export let store;
	const currencies = store.currencies;
	const numItems = store.numItems;
	const numCurrencies = store.numCurrencies;
	const editQuantities = store.editQuantities;
	const needsGM = store.needsGM;

	// With an actor, this gives currency from that actor to the pile, otherwise only a GM can edit the pile's currencies
	const canAddCurrency = !!store.recipient || game.user.isGM;
	$: addCurrencyDisabled = !!store.recipient && $needsGM;

</script>

<div>

	<div class="item-piles-flexrow">
		{#if $numCurrencies > 0}
			<h3>{localize("ITEM-PILES.Currencies")}:</h3>
		{/if}
		{#if canAddCurrency}
			<a class="item-piles-text-right item-piles-small-text item-piles-middle"
			   class:item-piles-clickable={!addCurrencyDisabled}
			   class:item-piles-clickable-link-disabled={addCurrencyDisabled}
			   on:click={() => { if (!addCurrencyDisabled) store.addCurrency(store.recipient); }}>
				<i class="fas fa-plus"></i> {localize("ITEM-PILES.Inspect.AddCurrency")}
			</a>
		{/if}
	</div>
	{#if $numCurrencies > 0}
		<div>
			{#each $currencies as currency, index (currency.identifier)}
				<ListEntry {store} bind:entry={currency} currency/>
			{/each}
		</div>
	{/if}

</div>
