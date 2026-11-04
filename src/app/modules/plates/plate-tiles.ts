import {PlateMenuItem} from "../plate-menu-items/plate-menu-item";

export interface PlateTile {
  /** item che rappresenta la tile (il primo dell'ordine) */
  item: PlateMenuItem;
  /** tutti gli item della tile: uno solo se la piastra non raggruppa */
  group: PlateMenuItem[];
}

/**
 * Costruisce le tile degli item. Con il raggruppamento per ordine tutti gli item dello stesso ordine
 * diventano un'unica tile, nella posizione del primo item; l'ordine di arrivo viene mantenuto.
 */
export function buildPlateTiles(items: PlateMenuItem[], groupByOrder: boolean): PlateTile[] {
  if (!groupByOrder) {
    return items.map(item => ({item, group: [item]}));
  }

  const groups = new Map<number, PlateMenuItem[]>();
  for (const item of items) {
    const group = groups.get(item.orderNumber);
    if (group) {
      group.push(item);
    } else {
      groups.set(item.orderNumber, [item]);
    }
  }
  return [...groups.values()].map(group => ({item: group[0], group}));
}
