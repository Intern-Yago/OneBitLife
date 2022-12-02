import { useNavigation } from '@react-navigation/native';
import React, {useState} from 'react'
import { View,StyleSheet, ScrollView, TouchableOpacity, Image} from "react-native";

export default function HabitPage(){
    const navigation = useNavigation()
    return(
        <View style={styles.container}>
            <ScrollView>
                <View>
                    <TouchableOpacity
                        style={styles.backPageBtn}
                        onPress={()=>navigation.goBack()}
                    >
                        <Image
                            source={require('../../assets/icons/arrowBack.png')}
                            style={styles.arrowBack}
                        />
                    </TouchableOpacity>
                    <View style={styles.mainContent}>

                    </View>
                </View>
            </ScrollView>
        </View>
    );  
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgba(21, 21, 21, 0.98)",
    },
    backPageBtn: {
        width: 40,
        height: 40,
        margin: 25,
    },
    arrowBack: {
        width: 40,
        height: 40,
    },
    mainContent: {
        width: 250,
        alignSelf: "center",
    },
    configButton: {
        alignItems: "center",   
    },
    title: {
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
        fontSize: 30,
    },
    inputText: {
        color: "white",
        fontSize: 16,
        marginTop: 35,
        marginBottom: 10,
        marginLeft: 5,
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: "#FFFFFF",
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    area: {
        color: "#BBBBBB",
        fontSize: 15,
    },
})