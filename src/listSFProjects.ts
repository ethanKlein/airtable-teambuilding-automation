import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';
import { AirtableService } from './services/airtableService';

// Load environment variables
dotenv.config();

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

interface Designer {
  id: string;
  fields: {
    'Table Designer List': string;
    'Location (WD)': string | string[];
    'Location 🔄': string | string[];
    'Location (General)': string | string[];
    'Location 🧩': string | string[];
    Hub: string | string[];
    'Region (WD)': string | string[];
    'Email (WD)': string;
    'Email (WD) 📡': string[];
  };
}

interface Project {
  id: string;
  fields: {
    'Project Name (Editable)': string;
    'Project Status': string | string[];
    'Project Status (WD)': string | string[];
    'Region (WD)': string | string[];
    'Locked Designers': string[];
    'Open Roles & Added Designers (Complete)': string[];
    'Project End Date (from Link to Projects Table (Workday) - Daily Sync)': any[];
    'Project Start Date': string;
    'Project End Date': string;
    'Project Number (WD)': string;
  };
}

async function getSlackMention(name: string, email: string | undefined): Promise<string> {
  if (!email) {
    console.log(`No email found for ${name}, falling back to @mention`);
    return `@${name}`;
  }

  try {
    // Look up user by email
    const result = await slack.users.lookupByEmail({ email });
    if (result.ok && result.user) {
      console.log(`Found Slack user for ${name} (${email}): ${result.user.id}`);
      return `<@${result.user.id}>`;
    }
  } catch (error) {
    console.error(`Error looking up Slack user for ${name} (${email}):`, error);
  }
  return `@${name}`;
}

async function listSFProjects() {
  const airtableService = new AirtableService();
  const designers = (await airtableService.getDesigners()) as unknown as Designer[];
  const projects = (await airtableService.getProjects()) as unknown as Project[];

  // Filter for SF Hub designers - simplified to just check Hub field
  const sfHubDesigners = designers.filter(designer => {
    const hub = designer.fields['Hub'];
    return Array.isArray(hub) && hub.includes('San Francisco');
  });

  console.log(`Found ${sfHubDesigners.length} SF Hub designers`);
  const sfHubDesignerIds = sfHubDesigners.map(d => d.id);

  // List of projects to focus on
  const focusProjects = [
    'AACo Westholme Nature-Led Brand',
    'Abbott Heart Failure Next Generation System',
    'ApneaCo Zephyr Patch Sprint',
    'BP Castrol Innovation',
    'Builders Vision - Innovation Engine',
    'C-A-T Resources Combat Tourniquet Design Improvement',
    'CalMHSA BHSA Planning Process Redesign',
    'Celo Innovation Studio',
    'Conrad Universal BMGF Refinement',
    'Elliptigo 11R Redesign',
    'ERG Council 2025',
    'Exact Sciences Cologuard Experience & Product Design',
    'HLTH Vegas 2024',
    'LA County Hollywood 2.0',
    'LeadingAge California - Year Long Innovation Program',
    'Lenovo AI Devices',
    'Rockefeller Year 2 Big Bets Climate',
    'Samsung Design Innovation Process',
    'SF Hub Gatherings',
    'Sigma Alimentos: The Studio',
    'Sony SIE Special Project: (TinkerToo)',
    'WSJ Phase 4'
  ];

  // Filter for active projects with SF Hub designers - simplified logic
  const activeProjects = projects.filter(project => {
    const projectName = project.fields['Project Name (Editable)'];
    const statusWD = project.fields['Project Status (WD)'];
    const isActive = Array.isArray(statusWD) ? statusWD.includes('Active') : statusWD === 'Active';
    
    // Check if project name starts with any of the focus projects
    const isInFocusList = focusProjects.some(focusProject => 
      projectName.startsWith(focusProject)
    );
    
    // Check if project has any SF Hub designers
    const lockedDesigners = project.fields['Locked Designers'] || [];
    const openRoles = project.fields['Open Roles & Added Designers (Complete)'] || [];
    const hasSFDesigner = [...lockedDesigners, ...openRoles].some(id => sfHubDesignerIds.includes(id));
    
    return isActive && isInFocusList && hasSFDesigner;
  });

  console.log(`Found ${activeProjects.length} active projects with SF Hub designers`);

  // Sort projects alphabetically
  activeProjects.sort((a, b) => {
    const nameA = a.fields['Project Name (Editable)'].toLowerCase();
    const nameB = b.fields['Project Name (Editable)'].toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Collect projects with their SF Hub designers
  const projectsWithDesigners = [];
  
  for (const project of activeProjects) {
      const projectName = project.fields['Project Name (Editable)'];
      const projectNumber = project.fields['Project Number (WD)'];
      const sfDesigners = new Map<string, [string, string]>();
      
      // Process designers...
      const lockedDesigners = project.fields['Locked Designers'] || [];
      const openRoles = project.fields['Open Roles & Added Designers (Complete)'] || [];
      
      for (const designerId of [...lockedDesigners, ...openRoles]) {
          try {
              const designer = designers.find(d => d.id === designerId);
              if (!designer) continue;
              
              const hub = designer.fields['Hub']?.[0];
              if (hub === 'San Francisco') {
                  const name = designer.fields['Table Designer List'];
                  const email = designer.fields['Email (WD) 📡']?.[0];
                  if (name && email) {
                      sfDesigners.set(name, [name, email]);
                  }
              }
          } catch (error) {
              console.error(`Error fetching designer ${designerId}:`, error);
          }
      }
      
      if (sfDesigners.size > 0) {
          projectsWithDesigners.push({
              project,
              designers: Array.from(sfDesigners.values())
          });
      }
  }

  // Format the message with projects and their designers
  const formattedMessage = await Promise.all(
      projectsWithDesigners.map(async ({ project, designers }) => {
          const designerMentions = await Promise.all(
              designers.map(async ([name, email]) => await getSlackMention(name, email))
          );
          // Remove the project ID (which is always a number in parentheses at the end)
          const projectName = project.fields['Project Name (Editable)'].replace(/ \(\d+\)$/, '');
          return `- ${projectName} ${designerMentions.join(' ')}`;
      })
  ).then(lines => `:disco-ball-still: Projects Week of ${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}\n\n${lines.join('\n')}`);

  // Post to Slack
  const channelId = process.env.SLACK_CHANNEL_ID;
  if (!channelId) {
      throw new Error('SLACK_CHANNEL_ID is not defined');
  }

  if (projectsWithDesigners.length > 0) {
      console.log('\nPosting message to Slack:', formattedMessage);
      await slack.chat.postMessage({
          channel: channelId,
          text: formattedMessage,
          mrkdwn: true
      });
      console.log('\nMessage posted successfully');
  } else {
      console.log('\nNo projects with SF Hub designers found');
  }
}

listSFProjects(); 