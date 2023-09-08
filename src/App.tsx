import * as React from 'react'
import { getUserData, IUserData } from './apiFunctions'

export const App = (): JSX.Element => {
    const [username, setUsername] = React.useState<string>('')
    const [userData, setUserData] = React.useState<IUserData>()
    const [isNoUser, setIsNoUser] = React.useState<boolean>(false)

    const handleInputChange = event => {
        const { value } = event.target
        setUsername(value)
    }

    const handleSubmit = async event => {
        event.preventDefault()
        isNoUser && setIsNoUser(false)
        setUserData(undefined)
        const data = await getUserData(username)
        if (data === "Error 404") {
            setIsNoUser(true)
            return
        }
        setUserData(data)
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text"
                    placeholder="enter github username"
                    value={ username }
                    onChange={handleInputChange}
                />
                <button
                    type="submit"
                >Search User</button>
            </form>
            {
                isNoUser &&
                <h3 color='red'>User Not Found</h3>
            }
            {
                userData &&
                <>
                    <h1>{userData.username}</h1>
                    <h3>Public Repositories: {userData.publicRepos}</h3>
                    <hr />
                    <h2>Repositories</h2>
                    <table>
                        <tbody>
                            {userData.repoData.map(repo => <tr>
                                <th>{repo.name}</th>
                                <td>{repo.desc}</td>
                            </tr>)}
                        </tbody>
                    </table>
                    
                </>
            }
        </>
    )
}