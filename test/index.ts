import * as Bounce from "..";
import * as Boom from "@hapi/boom";
import * as Lab from "@hapi/lab";

const { expect } = Lab.types;

class CustomErr extends Error {
  customProp = "customProp";
}

// rethrow
expect.type<void>(Bounce.rethrow(new Error(), "system"));
expect.type<void>(Bounce.rethrow(new Error(), "boom"));
expect.type<void>(Bounce.rethrow(new Error(), ["system", "boom"]));
expect.type<void>(Bounce.rethrow(new Error(), { prop: "prop" }));
expect.type<void>(
  Bounce.rethrow(new Error(), "system", { decorate: { prop: "prop" } })
);
expect.type<void>(
  Bounce.rethrow(new Error(), "system", {
    decorate: { prop: "prop" },
    override: new CustomErr(),
  })
);
expect.type<CustomErr & { prop: string }>(
  Bounce.rethrow(new Error(), "system", {
    decorate: { prop: "prop" },
    override: new CustomErr(),
    return: true,
  })
);
expect.type<CustomErr>(
  Bounce.rethrow(new Error(), "system", {
    override: new CustomErr(),
    return: true,
  })
);
expect.type<Error>(Bounce.rethrow(new Error(), "system", { return: true }));
expect.type<Error & { prop: string }>(
  Bounce.rethrow(new Error(), "system", {
    decorate: { prop: "prop" },
    return: true,
  })
);

expect.error(Bounce.rethrow(new Error(), "systm"));
expect.error(Bounce.rethrow(new Error(), "bom"));
expect.error(Bounce.rethrow(new Error(), ["system", "bom"]));
expect.error(Bounce.rethrow(new Error(), "system", { decorate: true }));
expect.error(
  Bounce.rethrow(new Error(), "system", { override: { prop: "prop" } })
);
expect.error(Bounce.rethrow(new Error(), "system", { return: 1 }));

// ignore
expect.type<void>(Bounce.ignore(new TypeError(), "system"));
expect.type<void>(Bounce.ignore(Boom.internal(), "boom"));
expect.type<void>(Bounce.ignore(new CustomErr(), { customProp: "customProp" }));
expect.type<void>(
  Bounce.ignore(new TypeError(), "system", { decorate: { prop: "prop" } })
);
expect.type<void>(
  Bounce.ignore(new TypeError(), "system", {
    decorate: { prop: "prop" },
    override: new CustomErr(),
  })
);
expect.type<CustomErr & { prop: string }>(
  Bounce.ignore(new TypeError(), "system", {
    decorate: { prop: "prop" },
    override: new CustomErr(),
    return: true,
  })
);
expect.type<CustomErr>(
  Bounce.ignore(new Error(), "system", {
    override: new CustomErr(),
    return: true,
  })
);
expect.type<Error>(Bounce.ignore(new Error(), "system", { return: true }));
expect.type<Error & { prop: string }>(
  Bounce.ignore(new Error(), "system", {
    decorate: { prop: "prop" },
    return: true,
  })
);

expect.error(Bounce.ignore(new Error(), "systm"));
expect.error(Bounce.ignore(new Error(), "bom"));
expect.error(Bounce.ignore(new Error(), "system", { decorate: true }));
expect.error(
  Bounce.ignore(new TypeError(), "system", { override: { prop: "prop" } })
);
expect.error(Bounce.ignore(new Error(), "system", { return: 1 }));

// background
expect.type<Promise<void>>(Bounce.background(() => {}));
expect.type<Promise<void>>(Bounce.background(() => {}, "rethrow"));
expect.type<Promise<void>>(Bounce.background(() => {}, "ignore"));
expect.type<Promise<void>>(Bounce.background(() => {}, "rethrow", "system"));
expect.type<Promise<void>>(Bounce.background(() => {}, "rethrow", "boom"));
expect.type<Promise<void>>(
  Bounce.background(() => {}, "rethrow", { prop: "prop" })
);
expect.type<Promise<void>>(
  Bounce.background(() => {}, "rethrow", "system", {
    decorate: { prop: "prop" },
  })
);
expect.type<Promise<void>>(
  Bounce.background(() => {}, "rethrow", "system", {
    decorate: { prop: "prop" },
    override: new CustomErr(),
  })
);
expect.type<Promise<void>>(
  Bounce.background(() => {}, "rethrow", "system", {
    decorate: { prop: "prop" },
    override: new CustomErr(),
    return: true,
  })
);
expect.type<Promise<void>>(
  Bounce.background(() => {}, "rethrow", "system", {
    override: new CustomErr(),
    return: true,
  })
);
expect.type<Promise<void>>(
  Bounce.background(() => {}, "rethrow", "system", { return: true })
);
expect.type<Promise<void>>(
  Bounce.background(() => {}, "rethrow", "system", {
    decorate: { prop: "prop" },
    return: true,
  })
);

expect.error(Bounce.background(() => {}, "rethro"));
expect.error(Bounce.background(() => {}, "ignor"));
expect.error(Bounce.background(() => {}, "rethrow", "systm"));
expect.error(Bounce.background(() => {}, "rethrow", "bom"));
expect.error(
  Bounce.background(() => {}, "rethrow", "system", { decorate: true })
);
expect.error(
  Bounce.background(() => {}, "rethrow", "system", {
    override: { prop: "prop" },
  })
);
expect.error(Bounce.background(() => {}, "rethrow", "system", { return: 1 }));

// isBoom
expect.type<boolean>(Bounce.isBoom(""));

// isError
expect.type<boolean>(Bounce.isError(""));

// isSystem
expect.type<boolean>(Bounce.isError(""));
