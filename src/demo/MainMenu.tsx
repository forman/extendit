/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import { executeCommand, useMenu } from "@/contrib";
import { useAppContext } from "./app-store";

function MainMenu() {
  const mainMenuItems = useMenu("main", useAppContext());

  // console.log(mainMenuItems)

  return (
    <div className="row2-item">
      <h1>Main Menu</h1>
      <p>
        Shows the contribution of the <code>menus.main</code> menu:
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
