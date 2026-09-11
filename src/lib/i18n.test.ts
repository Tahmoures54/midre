import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { t } from "./i18n.ts";

describe("i18n", () => {
  it("interpolates English and Persian strings", () => {
    assert.equal(t("added", { name: "Aspirin" }, "en"), "Aspirin added");
    assert.equal(t("added", { name: "آسپرین" }, "fa"), "آسپرین اضافه شد");
    assert.equal(t("percent", { n: 80 }, "en"), "80%");
    assert.equal(t("percent", { n: 80 }, "fa"), "80٪");
  });
});
