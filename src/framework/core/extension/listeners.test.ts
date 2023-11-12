/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { describe, expect, test, beforeEach, afterEach } from "vitest";
import {
  setExtensionListenersRegistry,
  addExtensionListener,
  emitExtensionRegistered,
  emitExtensionUnregistered,
  emitExtensionWillUnregister,
} from "./listeners";
import type { Extension, ExtensionListener } from "@/core/types";
import { newTestExtension } from "@/test/testing";

class TestExtensionListener implements ExtensionListener {
  readonly registered: Extension[] = [];
  readonly willUnregister: Extension[] = [];
  readonly unregistered: string[] = [];

  onExtensionRegistered(extension: Extension) {
    this.registered.push(extension);
  }
  onExtensionWillUnregister(extension: Extension) {
    this.willUnregister.push(extension);
  }
  onExtensionUnregistered(extensionId: string) {
    this.unregistered.push(extensionId);
  }
}

describe("", () => {
  let registry: Set<ExtensionListener>;
  beforeEach(() => {
    registry = setExtensionListenersRegistry(new Set<ExtensionListener>());
  });
  afterEach(() => {
    setExtensionListenersRegistry(registry);
  });

  test("emitExtensionRegistered", () => {
    const listener = new TestExtensionListener();
    const removeExtensionListener = addExtensionListener(listener);
    emitExtensionRegistered(newTestExtension("pippo:ext1"));
    emitExtensionRegistered(newTestExtension("pippo:ext2"));
    emitExtensionRegistered(newTestExtension("pippo:ext3"));
    expect(listener.registered.length).toEqual(3);
    removeExtensionListener();
  });

  test("emitExtensionWillUnregister", () => {
    const listener = new TestExtensionListener();
    const removeExtensionListener = addExtensionListener(listener);
    emitExtensionWillUnregister(newTestExtension("pippo:ext1"));
    emitExtensionWillUnregister(newTestExtension("pippo:ext2"));
    expect(listener.willUnregister.length).toEqual(2);
    removeExtensionListener();
  });

  test("emitExtensionUnregistered", () => {
    const listener = new TestExtensionListener();
    const removeExtensionListener = addExtensionListener(listener);
    emitExtensionUnregistered("pippo:ext1");
    emitExtensionUnregistered("pippo:ext2");
    emitExtensionUnregistered("pippo:ext3");
    emitExtensionUnregistered("pippo:ext4");
    expect(listener.unregistered.length).toEqual(4);
    removeExtensionListener();
  });
});
