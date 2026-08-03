import { useEffect, useState } from "react";
import ChangeNavigationService from "../services/ChangeNavigationService";
import AllPages from "./AllPages";
import HomePage from "./HomePage";

export default function Routes() {
  const [showHome, setShowHome] = useState("false");
  
  useEffect(() => {
    ChangeNavigationService.checkShowHome(1)
      .then((res) => {
        if (res && res.showHome) {
          setShowHome(res.showHome);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      {showHome === "true" ? <HomePage/> : <AllPages/>}
    </>
  )
}