// requireActual ensures you get the real file
// instead of an automock
// we use import type and <typeof ...> to still get types
// import {} from "jest";
import type * as Silly from "../main";
const { History } = jest.requireActual<typeof Silly>("../main");

describe("silly function", () => {
  test("guaranteed random", () => {
    const NewHistory = new History("emad");
    expect(NewHistory.name).toBe("emad");
  });
});

export {};
