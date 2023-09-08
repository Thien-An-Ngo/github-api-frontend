import { Octokit } from 'octokit'

export interface IUserData {
    username: string,
    publicRepos: number,
    repoData: {name: string, desc: string}[]
}

const fetchData = async (method: string, path: string, data: any): Promise<any> => {
    const octokit = new Octokit()

    return await octokit.request(`${method} ${path}`, data)
}

// For scalability as there might be a need to get more user information later ons
const getUser = async (username: string): Promise<
    {publicRepos: number, reposUrl: string} | "Error 404"
    > => {
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
    
    return {
        publicRepos: res.data.public_repos,
        reposUrl: res.data.repos_url
    }
}

export const getUserData = async (username: string): Promise<IUserData | "Error 404"> => {
    const userInfo = await getUser(username)

    if (userInfo === "Error 404") {
        return "Error 404"
    }

    const {publicRepos, reposUrl} = userInfo

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