/*********
    * 
    * CallComm Technologies, Inc. Confidential
    * ____
    * 
    *  Copyright CallComm Technologies, Inc. 2021. All rights reserved
    * 
    * NOTICE:  All information contained herein is, and remains
    * the property of CallComm Technologies, Inc. and its suppliers,
    * if any.  The intellectual and technical concepts contained
    * herein are proprietary to CallComm Technologies, Inc.
    * and its suppliers and may be covered by U.S. and Foreign Patents,
    * patents in process, and are protected by trade secret or copyright law.
    * Dissemination of this information or reproduction of this material
    * is strictly forbidden unless prior written permission is obtained
    * from CallComm Technologies, Inc.
*/

import { useEffect } from "react";


const useOnClickOutside = (ref, handler) => {
  useEffect(
    () => {
      const listener = event => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }

        handler(event);
      };

      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);

      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    [ref, handler]
  );
}

export default useOnClickOutside;