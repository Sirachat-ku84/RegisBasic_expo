import { StyleSheet } from "react-native";
import { colors } from "./theme";

export const styles = StyleSheet.create({  

    container :{marginBottom: 14},
    label : {fontSize: 14, color: colors.text, marginBottom: 6},
    input :{
        backgroundColor : colors.card,
        borderWidth : 1,
        borderColor : colors.border,
        borderRadius : 10,
        paddingHorizontal : 12,
        paddingVertical : 11,
        color : colors.text,
        fontSize : 16,
    },
    inputError :{
        borderColor : colors.red,
    },
    errorText :{
        color : colors.red,
        fontSize : 12,
        marginTop : 4,
    }, 
    hinText :{
        color : colors.dim,
        fontSize : 12,
        marginTop : 4,
    },
    
});