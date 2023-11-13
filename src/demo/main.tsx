/*
 * Copyright © 2023 Norman Fomferra
 * Permissions are hereby granted under the terms of the MIT License:
 * https://opensource.org/licenses/MIT.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { assertDefined } from "@/util/assert";
import App from "./App";

const root = document.getElementById("root");
assertDefined(root, "root");
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
