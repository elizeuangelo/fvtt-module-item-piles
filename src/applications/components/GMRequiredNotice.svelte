<script>

	import { localize } from "#runtime/util/i18n";

	/** The localization key of the message explaining what needs a GM */
	export let message = "ITEM-PILES.Warnings.NeedsGM";

</script>

<div class="item-piles-gm-required-notice">
	<i class="fas fa-triangle-exclamation"></i>
	<span>{localize(message)}</span>
</div>

<style lang="scss">

  .item-piles-gm-required-notice {
    flex: 0 1 auto;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0.25rem 0;
    padding: 0.25rem 0.5rem;
    border: 1px solid rgba(179, 120, 0, 0.6);
    border-radius: 3px;
    background-color: rgba(255, 190, 0, 0.15);
    font-size: 0.85rem;
  }

</style>
