/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import AvailableExtensions from "../components/AvailableExtensions";
import InstalledExtensions from "../components/InstalledExtensions";
import CommandPalette from "../components/CommandPalette";
import ViewContainer from "../components/ViewContainer";
import MainMenu from "../components/MainMenu";
import { initApp } from "./init";

import "./App.css";

initApp();

function App() {
  return (
    <>
      <div className="row2">
        <AvailableExtensions />
        <InstalledExtensions />
      </div>
      <div className="row2">
        <CommandPalette />
        <MainMenu />
      </div>
      <div className="row1">
        <ViewContainer />
      </div>
    </>
  );
}

export default App;
