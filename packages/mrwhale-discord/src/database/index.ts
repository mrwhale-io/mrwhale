import { Database } from "@mrwhale-io/core";
import * as path from "path";

import * as config from "../../config.json";

const url = path.join(process.cwd(), config.database);

export const database = Database.instance(url);
database.init();
