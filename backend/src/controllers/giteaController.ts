import { Request, Response } from 'express';
import { Store } from '../data/mockStore.js';

export const getGiteaStatus = (req: Request, res: Response) => {
  return res.json({
    status: 'online',
    service: 'plexi-gitea Private Git Service',
    instanceUrl: 'https://git.plexivia.com',
    webPort: 3001,
    sshPort: 2222,
    sshHost: 'git.plexivia.com',
    sshUser: 'git',
    version: '1.22.3',
    activeRepositoriesCount: Store.giteaRepos.length,
    sshFingerprint: 'SHA256:4K3u5+plexiPrivateGitHostKey98A2f190',
    primaryOrganization: 'plexivia',
    capabilities: [
      'Dual-Remote Push Mirroring',
      'SSH Key Authentication (Port 2222)',
      'Automated CI/CD Webhooks to Plexivia',
      'LFS Large File Storage'
    ]
  });
};

export const getRepositories = (req: Request, res: Response) => {
  return res.json({
    status: 'success',
    repositories: Store.giteaRepos
  });
};

export const getDualRemoteGuide = (req: Request, res: Response) => {
  const { repo = 'plexi-hub-core' } = req.query;
  const repoName = String(repo);

  return res.json({
    status: 'success',
    repoName,
    instructions: {
      title: 'Plexivia Dual-Remote Configuration Guide',
      description: 'Configure your local repository to push to both the internal private Gitea server (https://git.plexivia.com:2222) and an optional secondary remote (e.g. GitHub/GitLab).',
      steps: [
        {
          step: 1,
          title: 'Verify SSH Port 2222 Connectivity',
          command: 'ssh -T -p 2222 git@git.plexivia.com',
          expectedOutput: 'Hi there, username! You have successfully authenticated to Plexi-Gitea with key.'
        },
        {
          step: 2,
          title: 'Set Primary Origin to Plexivia Gitea',
          command: "git remote set-url origin ssh://git@git.plexivia.com:2222/plexivia/" + repoName + ".git",
          description: 'Points default fetch and push origin to internal high-speed private Gitea.'
        },
        {
          step: 3,
          title: 'Add Dual-Push Secondary Mirror (GitHub / Backup)',
          command: "git remote set-url --add --push origin ssh://git@git.plexivia.com:2222/plexivia/" + repoName + ".git\ngit remote set-url --add --push origin git@github.com:plexivia/" + repoName + ".git",
          description: 'A single git push origin main will now simultaneously push to both Gitea and GitHub in parallel.'
        },
        {
          step: 4,
          title: 'Verify Remote URLs',
          command: 'git remote -v',
          expectedOutput: "origin  ssh://git@git.plexivia.com:2222/plexivia/" + repoName + ".git (fetch)\norigin  ssh://git@git.plexivia.com:2222/plexivia/" + repoName + ".git (push)\norigin  git@github.com:plexivia/" + repoName + ".git (push)"
        }
      ]
    }
  });
};
