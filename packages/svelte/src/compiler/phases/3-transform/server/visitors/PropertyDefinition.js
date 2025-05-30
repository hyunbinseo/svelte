/** @import { Expression, PropertyDefinition } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';

/**
 * @param {PropertyDefinition} node
 * @param {Context} context
 */
export function PropertyDefinition(node, context) {
	if (context.state.analysis.runes && node.value != null && node.value.type === 'CallExpression') {
		const rune = get_rune(node.value, context.state.scope);

		if (rune === '$state' || rune === '$state.raw') {
			return {
				...node,
				value:
					node.value.arguments.length === 0
						? null
						: /** @type {Expression} */ (context.visit(node.value.arguments[0]))
			};
		}

		if (rune === '$derived.by' || rune === '$derived') {
			const fn = /** @type {Expression} */ (context.visit(node.value.arguments[0]));
			return {
				...node,
				value:
					node.value.arguments.length === 0
						? null
						: b.call('$.derived', rune === '$derived' ? b.thunk(fn) : fn)
			};
		}
	}

	context.next();
}
