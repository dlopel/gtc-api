import pool from '../connectDb'
import DropDownListRow from '../types/DropDownListRow'
import PolicyStorage from '../types/policy'

export const isIdUnique = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   SELECT id
                   FROM public."POLICIES" 
                   WHERE UPPER(id || '')=$1`,
            values: [id.toUpperCase()]
        }
        const result = await pool.query(query)
        return result.rowCount ? false : true
    }
}

export const createPolicy = async (policy: PolicyStorage) => {
    if (policy) {
        const query = {
            text: `
                   INSERT INTO public."POLICIES" 
                   (id, 
                    endorsement, 
                    "dateStart", 
                    "dateEnd", 
                    "insuranceCarrier", 
                    "insuranceCompany", 
                    "netPremium",
                    telephone,
                    observation,
                    "imagePath")
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            values: [
                policy.id,
                policy.endorsement,
                policy.dateStart,
                policy.dateEnd,
                policy.insuranceCarrier,
                policy.insuranceCompany,
                policy.netPremium,
                policy.telephone,
                policy.observation,
                policy.imagePath
            ]
        }
        await pool.query(query)
    }
}

export const updatePolicyById = async ({ observation, id }) => {
    //observation is field null
    if (id) {
        const query = {
            text: `
                    UPDATE public."POLICIES" SET
                    observation=$1
                    WHERE id=$2 `,
            values: [observation, id]
        }
        await pool.query(query)
    }
}

// export const updatePolicyById = async (policy: PolicyStorage) => {
//     if (policy && policy.id) {
//         const updateHeaderText = 'UPDATE public."POLICIES"'
//         let setText = 'SET' //complete ...
//         let whereText = 'WHERE id=$' //add parameter value

//         const keyValueArray = Object.entries(policy)
//         let valueList: any[] = []
//         let counter = 0
//         for (let i = 0; i < keyValueArray.length; i++) {
//             if (keyValueArray[i][1] != null && keyValueArray[i][0] !== 'id') {
//                 counter++

//                 if (keyValueArray[i][0]) {
//                     setText = `${setText} "${keyValueArray[i][0]}"=$${counter},`
//                     valueList.push(keyValueArray[i][1])
//                 }
//             }
//         }
//         //borramos la ultima coma del setText del update
//         setText = setText.slice(0, -1)

//         //añadiendo la posicion del parametro al texto del where 
//         //y agregarlo el valor id del driver a la lista de valores
//         counter++
//         whereText = `${whereText}${counter}`
//         valueList.push(policy.id)

//         const query = {
//             text: `
//                ${updateHeaderText}
//                ${setText}
//                ${whereText}`,
//             values: valueList
//         }
//         await pool.query(query)
//     }
// }

export const getPolicies = async (): Promise<PolicyStorage[]> => {
    const text = `
                  SELECT 
                  id, 
                  endorsement, 
                  to_char("dateStart", 'yyyy-MM-dd') "dateStart", 
                  to_char("dateEnd", 'yyyy-MM-dd') "dateEnd", 
                  "insuranceCarrier", 
                  "insuranceCompany", 
                  "netPremium",
                  telephone,
                  "imagePath",
                  observation
                  FROM public."POLICIES"
                  ORDER BY "dateStart"`
    const result = await pool.query(text)
    return result.rows
}

export const getPolicyById = async (id: string): Promise<PolicyStorage | null> => {
    if (id) {
        const query = {
            text: `
                    SELECT
                    "endorsement", 
                    to_char("dateStart", 'yyyy-MM-dd') "dateStart", 
                    to_char("dateEnd", 'yyyy-MM-dd') "dateEnd", 
                    "insuranceCarrier", 
                    "insuranceCompany", 
                    "netPremium",
                    telephone,
                    "imagePath",
                    observation
                    FROM public."POLICIES"
                    WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<PolicyStorage>(query)
        return result.rowCount ? result.rows[0] : null
    }
}

export const getDataForDropDownList = async (): Promise<DropDownListRow[]> => {
    const text = `
                  SELECT 
                  id, 
                  endorsement AS value
                  FROM public."POLICIES"
                  ORDER BY endorsement`
    const result = await pool.query<DropDownListRow>(text)
    return result.rows
}

export const getImagePathById = async (id: string): Promise<string | null> => {
    if (id) {
        const query = {
            text: `
                  SELECT 
                  "imagePath"
                  FROM public."POLICIES"
                  WHERE id=$1`,
            values: [id]
        }
        const result = await pool.query<{ imagePath: string }>(query)
        return result.rowCount ? result.rows[0].imagePath : null
    }
}

export const deletePolicyById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                   DELETE FROM public."POLICIES"
                   WHERE id = $1`,
            values: [id]
        }
        await pool.query(query)
    }
}

/**Los que dependen de la tabla POLICIES */
export const hasDependents = async (policyId: string) => {
    if (policyId) {
        const query = {
            text: `
                    SELECT policy_id
                    FROM public."UNITS"
                    WHERE policy_id=$1`,
            values: [policyId]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}
