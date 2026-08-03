import React, { useEffect, useState } from 'react'
import { Image} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import HabitsData from '../../../Database/HabitData';

import styles from '../styles'

export default function SelectHabit({habit, habitInput}){
    const [selected, setSelected] = useState(
        habit?.habitName ? habit?.habitName : "-"
    )
    const [data, setData] = useState();

    useEffect(() => {
        if (habit?.habitArea === "Mente") {
          setData(HabitsData.dataMind);
        }
        if (habit?.habitArea === "Financeiro") {
          setData(HabitsData.dataMoney);
        }
        if (habit?.habitArea === "Corpo") {
          setData(HabitsData.dataBody);
        }
        if (habit?.habitArea === "Humor") {
          setData(HabitsData.dataFun);
        }
        habitInput(habit?.habitName ? habit?.habitName : undefined);
      }, []);

    return(
        <>
            <SelectList
                setSelected={(val) => {
                    setSelected(val);
                    habitInput(val);
                }}
                data={data}
                search={false}
                placeholder={selected}
                boxStyles={styles.boxStyle}
                inputStyles={styles.inputStyle}
                dropdownStyles={styles.dropdownStyle}
                dropdownItemStyles={styles.dropdownItemStyle}
                dropdownTextStyles={styles.dropdownTextStyle}
                arrowicon={
                    <Image
                        source={require("../../../assets/icons/arrowDropdown.png")}
                        style={styles.arrow}
                    />
                }
            />
    </>
    );  
}
