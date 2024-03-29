import '../test/matchers';

import * as Path from './path';
import * as Grid from './grid';

describe('Path', () => {
    let distGrid: Grid.NumGrid;
    let costGrid: Grid.NumGrid;

    afterEach(() => {
        Grid.free(distGrid);
        Grid.free(costGrid);
    });

    test('can scan a grid', () => {
        distGrid = Grid.alloc(10, 10);
        costGrid = Grid.alloc(10, 10, 1);

        costGrid[3][2] = Path.OBSTRUCTION;
        costGrid[4][2] = Path.OBSTRUCTION;
        costGrid[5][2] = Path.OBSTRUCTION;
        costGrid[6][2] = Path.OBSTRUCTION;

        Path.calculateDistances(distGrid, 4, 4, costGrid, true);

        expect(distGrid[4][4]).toEqual(0);
        expect(distGrid[4][5]).toEqual(1);
        expect(distGrid[5][5]).toFloatEqual(1.4142); // diagonals cost sqrt(2)
        expect(distGrid[4][8]).toEqual(4);
        expect(distGrid[8][4]).toEqual(4);
        expect(distGrid[4][1]).toFloatEqual(6.4142); // have to go around stuff
        expect(distGrid[4][9]).toEqual(30000);
    });

    test('safety map', () => {
        distGrid = Grid.alloc(10, 10);
        costGrid = Grid.alloc(10, 10, 1);

        costGrid[3][2] = Path.OBSTRUCTION;
        costGrid[4][2] = Path.OBSTRUCTION;
        costGrid[5][2] = Path.OBSTRUCTION;
        costGrid[6][2] = Path.OBSTRUCTION;

        // player is at 4,4
        Path.calculateDistances(distGrid, 4, 4, costGrid, true);
        distGrid.update((v) => v * -1); // Can set factor to be < -1 e.g. -1.2
        costGrid[4][4] = Path.FORBIDDEN;
        Path.rescan(distGrid, costGrid, true);
        distGrid.update((v) => (v <= -30000 ? 30000 : v));

        // let out = [];
        // for (let y = 0; y < distGrid.height; ++y) {
        //     let line = '' + y + ') ';
        //     for (let x = 0; x < distGrid.width; ++x) {
        //         line += distGrid[x][y].toFixed(2).padStart(8, ' ') + ' ';
        //     }
        //     out.push(line);
        // }
        // console.log(out.join('\n'));

        // will let you run away from goal location

        expect(distGrid[4][4]).toEqual(-0);
        expect(distGrid[3][4]).toBeLessThan(distGrid[4][4]);
        expect(distGrid[2][4]).toBeLessThan(distGrid[3][4]);
        expect(distGrid[1][4]).toBeLessThan(distGrid[2][4]);

        // walls are still obstructions
        expect(distGrid[0][0]).toEqual(Path.NO_PATH);
    });

    //   test("can calculate a path", () => {
    //     const map = GW.make.map(10, 10, { tile: "FLOOR" });
    //     const player = GW.make.player({ name: "hero" });

    //     map.addActor(2, 2, player);

    //     expect(player.mapToMe).not.toBeDefined();
    //     player.updateMapToMe();
    //     expect(player.mapToMe).toBeDefined();
    //     expect(player.mapToMe.x).toEqual(player.x);
    //     expect(player.mapToMe.y).toEqual(player.y);

    //     const path = player.getPath(5, 7, map);
    //     // console.log(path);
    //     expect(path.length).toEqual(5);
    //   });

    //   function makeMap(data, player) {
    //     const height = data.length + 2;
    //     const width = data.reduce((max, line) => Math.max(max, line.length), 0) + 2;

    //     const map = (GW.data.map = GW.make.map(width, height, {
    //       floor: "FLOOR",
    //       wall: "WALL",
    //     }));
    //     for (let y = 0; y < data.length; ++y) {
    //       const line = data[y];
    //       for (let x = 0; x < line.length; ++x) {
    //         const ch = line[x];
    //         if (ch == "#") {
    //           map.setTile(x + 1, y + 1, "WALL");
    //         } else if (ch == "@") {
    //           map.locations.start = [x + 1, y + 1];
    //           map.addActor(x + 1, y + 1, player);
    //         } else if (ch == "X") {
    //           map.locations.end = [x + 1, y + 1];
    //         } else if (ch == "A") {
    //           const actor = GW.make.actor({ name: "Actor", ch: "A", fg: "green" });
    //           map.addActor(x + 1, y + 1, actor);
    //         }
    //       }
    //     }
    //     map.revealAll();
    //     GW.config.fov = true;
    //     GW.visibility.update(map, player.x, player.y, 20);
    //     GW.config.fov = false;
    //     player.updateMapToMe();
    //     return map;
    //   }

    //   function testResults(data, map, player, path) {
    //     let success = true;
    //     if (!path) {
    //       // look for X and .
    //       success = !data.some((line) => line.match(/[\.X]/));
    //     } else {
    //       for (let i = 0; i < path.length; ++i) {
    //         const [x, y] = path[i];
    //         const ch = data[y - 1][x - 1];
    //         if (!"X.".includes(ch)) success = false;
    //       }
    //     }
    //     if (!success) {
    //       path = path || [];
    //       console.log("ACTUAL");
    //       map.dump();

    //       console.log("MEMORY");
    //       map.dump((c) =>
    //         c.isVisible() ? c.groundTile.sprite.ch : c.memory.sprite.ch
    //       );

    //       console.log("VISIBLE");
    //       map.dump((c) => (c.isVisible() ? c.groundTile.sprite.ch : "*"));
    //       player.costGrid.dump();
    //       player.mapToMe.dump();
    //       console.log("start", map.locations.start);
    //       console.log("end", map.locations.end);
    //       console.log(path);

    //       let steps = [];
    //       path.forEach((step) => {
    //         steps.push(step + " : " + player.mapToMe[step[0]][step[1]]);
    //       });
    //       console.log(steps.join("\n"));

    //       steps = [];
    //       for (let j = 0; j < data.length; ++j) {
    //         const line = data[j];
    //         for (let i = 0; i < line.length; ++i) {
    //           const ch = line[i];
    //           if (ch == "X" || ch == ".") {
    //             const x = i + 1;
    //             const y = j + 1;
    //             const v = player.mapToMe[x][y];
    //             steps.push([x, y, v]);
    //           }
    //         }
    //       }
    //       steps.sort((a, b) => b[2] - a[2]);
    //       console.log(steps.join("\n"));
    //     }
    //     return success;
    //   }

    //   function testPath(data) {
    //     const player = GW.make.player();
    //     const map = makeMap(data, player);
    //     const path = player.getPath(
    //       map.locations.end[0],
    //       map.locations.end[1],
    //       map
    //     );
    //     return testResults(data, map, player, path);
    //   }

    //   test("finds correct path", () => {
    //     const m = [
    //       "####X   ",
    //       "####.   ",
    //       "####.   ",
    //       "####.   ",
    //       "####.   ",
    //       "@....   ",
    //       "        ",
    //     ];

    //     expect(testPath(m)).toBeTruthy();
    //   });

    //   test("finds path around actor", () => {
    //     const m = [
    //       "####X   ",
    //       "#### .  ",
    //       "####A.  ",
    //       "####.   ",
    //       "####.   ",
    //       "@....   ",
    //       "        ",
    //     ];

    //     expect(testPath(m)).toBeTruthy();
    //   });

    //   test("handles player memory", () => {
    //     const data = [
    //       "####X   ",
    //       "#### .  ",
    //       "####A.  ",
    //       "####.   ",
    //       "####.   ",
    //       "@....   ",
    //       "        ",
    //     ];

    //     const player = (GW.data.player = GW.make.player());
    //     const map = makeMap(data, player);

    //     const cell = map.cell(5, 3);
    //     expect(cell.actor).toBeObject();
    //     expect(cell.actor).not.toBeNull();
    //     expect(cell.memory.actor).toBe(cell.actor);

    //     map.moveActor(6, 3, cell.actor);
    //     player.updateMapToMe(true);

    //     debugger;

    //     const path = player.getPath(
    //       map.locations.end[0],
    //       map.locations.end[1],
    //       map
    //     );
    //     expect(testResults(data, map, player, path)).toBeTruthy();
    //   });
});
