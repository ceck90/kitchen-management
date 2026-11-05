import {buildPlateTiles} from "./plate-tiles";
import {PlateMenuItem, Status} from "../plate-menu-items/plate-menu-item";

describe('buildPlateTiles', () => {
  const item = (id: string, orderNumber: number): PlateMenuItem => ({
    id,
    orderNumber,
    menuItem: {id: 'm' + id, name: 'Item ' + id},
    status: Status.Progress,
    createdDate: null,
    clientName: '',
    tableNumber: ''
  });

  const items = [item('1', 10), item('2', 11), item('3', 10), item('4', 12), item('5', 10)];

  it('keeps one tile per item when the plate does not group', () => {
    const tiles = buildPlateTiles(items, false);
    expect(tiles.length).toBe(5);
    expect(tiles.every(t => t.group.length === 1 && t.group[0] === t.item)).toBeTrue();
  });

  it('groups the items of the same order in one tile, in order of arrival', () => {
    const tiles = buildPlateTiles(items, true);
    expect(tiles.map(t => t.item.orderNumber)).toEqual([10, 11, 12]);
    expect(tiles[0].group.map(i => i.id)).toEqual(['1', '3', '5']);
    expect(tiles[1].group.map(i => i.id)).toEqual(['2']);
  });

  it('returns no tiles for no items', () => {
    expect(buildPlateTiles([], true)).toEqual([]);
  });
});
