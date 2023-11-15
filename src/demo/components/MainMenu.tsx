/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { executeCommand, useMenu } from "@/contrib";
import { useAppContext } from "../app/store";
import ApiLink from "./ApiLink";

function MainMenu() {
  const mainMenuItems = useMenu("main", useAppContext());

  // console.log(mainMenuItems)

  return (
    <div className="row2-item">
      <h2>Main Menu</h2>
      <p>
        Shows the contributions made to the <code>main</code> menu of the{" "}
        <ApiLink
          module="contrib"
          type="variables"
          name="menusPoint"
          text="menus"
        />{" "}
        contribution point. Menu items that select the current view are disabled
        using a <strong>when-clause</strong> if the corresponding view is
        already shown.
      </p>
      <div className="menu">
        {mainMenuItems.map((menuItem) =>
          menuItem.command ? (
            <button
              key={menuItem.id}
              onClick={() => {
                void executeCommand(menuItem.command!);
              }}
              disabled={menuItem.disabled}
              type="button"
              className="menu-item"
            >
              {menuItem.label}
            </button>
          ) : (
            <hr key={menuItem.id} className="menu-separator" />
          )
        )}
      </div>
    </div>
  );
}

export default MainMenu;
