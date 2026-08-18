#!/usr/bin/env node
'use strict';

/* Historical compatibility shim.
 * Six-core public classification was retired on 2026-08-18.
 * Any legacy invocation must normalize to Business Hierarchy v3 instead of restoring six equal core businesses.
 */
require('./enforce-business-hierarchy-v3.js');
