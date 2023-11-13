/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { executeCommand, useCommandPalette } from "@/contrib";
import { useAppContext } from "../app/store";
import ApiLink from "./ApiLink";

function CommandPalette() {
  const menuItems = useCommandPalette(useAppContext());

  return (
    <div className="row2-item">
      <h1>Command Palette</h1>
      <p>
        Shows all available commands of the{" "}
        <ApiLink
          module="contrib"
          type="variables"
          name="commandsPoint"
          text="commands"
        />{" "}
        contribution point, except those removed by <code>when</code>-clauses in
        items of the <code>commandPalette</code> menu of the{" "}
        <ApiLink
          module="contrib"
          type="variables"
          name="menusPoint"
          text="menus"
        />{" "}
        contribution point.
      </p>
      <div className="button-bar">
        {menuItems.map((menuItem) => (
          <button
            key={menuItem.id}
            onClick={() => {
              void executeCommand(menuItem.command);
            }}
            disabled={menuItem.disabled}
            type="button"
          >
            {menuItem.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CommandPalette;
