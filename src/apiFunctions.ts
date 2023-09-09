import { Octokit } from 'octokit'

export interface IUserData {
    username: string,
    publicRepos: number,
    repoData: {name: string, desc: string}[]
}

// listed most common http methods for future additions
type httpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// For scalability to have an internal function capable of fetching github api data
/**
 * @async
 * @desc fetches data from github api via octokit
 * @param {httpMethod} method - a string containing the http method of the request
 * @param {string} path - string containing the url path to the required data
 * @param { { [key: string]: any } } data - object containing relevant data for the request
 * @returns {Promise<any>} - returns a promise containing the requested data
 */
const fetchData = async (
    method: httpMethod,
    path: string,
    data: { [key: string]: any }
): Promise<any> => {
    const octokit = new Octokit()

    return await octokit.request(`${method} ${path}`, data)
}

// Similarly, for scalability as there might be a need to get more user information later ons
/**
 * @async
 * @desc checks if user exist and fetches public repo count if so
 * @param {string} username - name of desired user
 * @returns {Promise<number | "Error 404">} returns the number of public repos if user exists and "Error 404" if not
 */
const getPublicRepos = async (username: string): Promise<number | "Error 404"> => {
    const path = `/users/{username}`
    const data = {
        username: username,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    
    const res:any = await fetchData('GET', path, data)
                        .then(res => res)
                        .catch(err => "Error 404")

    if (res === "Error 404") {
        return "Error 404"
    }
    
    return res.data.public_repos
}

/**
 * @async
 * @desc function fetching all needed user data
 * @param {string} username - the username of the desired user
 * @returns {Promise<IUserData | "Error 404">} returns a promise containing the required user data or "Error 404" if user doesn't exists
 */
export const getUserData = async (username: string): Promise<IUserData | "Error 404"> => {
    const publicRepos = await getPublicRepos(username)

    if (publicRepos === "Error 404") {
        return "Error 404"
    }

    const repos = await fetchData(
        'GET', '/users/{username}/repos', {
            username: username,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }
        )

    return {
        username: username,
        publicRepos: publicRepos,
        repoData: repos.data.map(repo => {
            return {name: repo.name, desc: repo.description}
        })
    }
}