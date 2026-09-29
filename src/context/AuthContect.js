import { createContext,useContext,userState,useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";

import { loginStudent,getStudents } from "../db/database";
import { saveSession,loadSession,clearSession } from "../untils/session";

const AuthContext = createContext(null)

export function AuthProvider({childen}){
     const db = useSQLiteContext()

     const [user,setUser] = useState(null)
     const [restoring,setRestoring] = useState(null)

     useEffect(() => {
        async function restore(){
            const id = loadSession()
            if(id != null){
                const found = await getStudents(db,id)
                if(found) setUser(found)
                else await clearSession()
            }
            setRestoring(false)
        }
        restore()

     },[db])

     async function login(username,password){
        const result = await loginStudent(db,username,password)

        if(result.ok){
            await saveSession(result.user.id);
            setUser(result.user)
        }

        return result
     }

     async function logout(){
        await clearSession()
        setUser(null)
        
     }

     return (
        <AuthContext.Provider value = {{user,restoring,login,logout}}>
            {childen}
        </AuthContext.Provider>
     )
}

export function useAuth(){
    const ctx = useContext(AuthContext)
    if(ctx == null ){
        throw new Error('useAuth ต้องใช้งานใน <AuthProvider> เท่านั้น')
    }
    return ctx
}