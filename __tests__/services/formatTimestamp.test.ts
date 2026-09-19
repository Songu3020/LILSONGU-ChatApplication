import {formatTimestamp} from "../../src/services/conversations";

describe("formatTimestamp", () =>{
    it("returns 'just now' for a timestamp less than a minute ago",() =>{
        const now = Date.now();
        expect(formatTimestamp(now)).toBe("just now");
    });

    it("returns minute ago for a timestamp under an hour old", () =>{
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        expect(formatTimestamp(fiveMinutesAgo)).toBe("5m ago");
    });

    it("returns hours ago for a timestamp under a day old", () =>{
        const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
        expect(formatTimestamp(threeHoursAgo)).toBe("3h ago");
    });
});