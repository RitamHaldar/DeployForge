import { Octokit } from "@octokit/rest";
import { userModel } from '../models/user.model.js';
export async function ListRepos(req, res) {
    const user = req.user;
    if (!user || !user.id) {
        return res.status(401).json({ error: 'Unauthorized: User not found in request' });
    }
    const dbUser = await userModel.findById(user.id);
    const token = dbUser?.GitHubAccessToken;
    if (!token)
        return res.status(401).json({ error: 'Missing access token' });
    try {
        const octokit = new Octokit({ auth: token });
        const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 50,
        });
        const repoList = repos.map((repo) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            private: repo.private,
            cloneUrl: repo.clone_url,
            defaultBranch: repo.default_branch,
        }));
        res.status(200).json(repoList);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch repositories' });
    }
}
