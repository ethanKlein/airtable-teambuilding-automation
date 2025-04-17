import { AirtableService } from './services/airtableService';
import dotenv from 'dotenv';

dotenv.config();

interface Project {
  id: string;
  fields: {
    'Project Name (Editable)'?: string;
    'Project Status (WD)'?: string[];
    'Region (WD)'?: string | string[];
    'Locked Designers 🧩'?: string[];
    'Open Roles & Added Designers (Complete)'?: string[];
  };
}

interface Designer {
  id: string;
  fields: {
    'Table Designer List'?: string;
    'Hub'?: string;
  };
}

async function listNAProjects() {
  try {
    const airtableService = new AirtableService();
    
    // Fetch all projects
    console.log('\nFetching projects...');
    const projects = (await airtableService.getProjects()) as unknown as Project[];
    console.log(`Found ${projects.length} total projects`);

    // Debug: Print first 5 projects with their status values
    console.log('\n🔍 Debug: First 5 projects with status:');
    projects.slice(0, 5).forEach(project => {
      console.log(`\nProject: ${project.fields['Project Name (Editable)']}`);
      const status = project.fields['Project Status (WD)'];
      console.log('Raw status value:', JSON.stringify(status, null, 2));
    });

    // Count projects by status
    const activeProjects = projects.filter(p => {
      const statusArray = p.fields['Project Status (WD)'];
      if (!statusArray || !Array.isArray(statusArray) || statusArray.length === 0) return false;
      return statusArray.some(status => status.toLowerCase() === 'active');
    });

    const undefinedStatusProjects = projects.filter(p => {
      const statusArray = p.fields['Project Status (WD)'];
      return !statusArray || !Array.isArray(statusArray) || statusArray.length === 0;
    });

    const otherStatusProjects = projects.filter(p => {
      const statusArray = p.fields['Project Status (WD)'];
      if (!statusArray || !Array.isArray(statusArray) || statusArray.length === 0) return false;
      return !statusArray.some(status => status.toLowerCase() === 'active');
    });

    console.log('\n📊 Project Status Breakdown:');
    console.log(`Total projects: ${projects.length}`);
    console.log(`Active projects: ${activeProjects.length}`);
    console.log(`Projects with undefined status: ${undefinedStatusProjects.length}`);
    console.log(`Projects with other status: ${otherStatusProjects.length}`);

    // Show all unique status values
    const uniqueStatuses = new Set<string>();
    projects.forEach(project => {
      const statusArray = project.fields['Project Status (WD)'];
      if (statusArray && Array.isArray(statusArray)) {
        statusArray.forEach(status => {
          if (status) {
            uniqueStatuses.add(status);
          }
        });
      }
    });

    console.log('\n📋 Unique Status Values Found:');
    Array.from(uniqueStatuses).sort().forEach(status => {
      console.log(`- ${status}`);
    });

    // Print sample of active projects
    console.log('\n📋 Sample of Active Projects (first 5):');
    activeProjects.slice(0, 5).forEach(project => {
      console.log(`\nProject: ${project.fields['Project Name (Editable)']}`);
      const statusArray = project.fields['Project Status (WD)'];
      if (statusArray && Array.isArray(statusArray)) {
        console.log('Status Values:');
        statusArray.forEach(status => {
          console.log(`- ${status}`);
        });
      }
    });
    
    // Fetch all designers
    console.log('\nFetching designers...');
    const designers = (await airtableService.getDesigners()) as unknown as Designer[];
    console.log(`Found ${designers.length} total designers`);

    // Filter for San Francisco Hub designers
    const sfHubDesigners = designers.filter(designer => {
      const hub = designer.fields['Hub'];
      return hub === 'San Francisco';
    });

    console.log(`\n📊 Found ${sfHubDesigners.length} San Francisco Hub designers:`);
    
    // Print SF Hub designers
    sfHubDesigners.forEach(designer => {
      console.log(`\n👤 ${designer.fields['Table Designer List'] || 'Name not set'}`);
    });
    
  } catch (error) {
    console.error('Error listing projects:', error);
  }
}

listNAProjects(); 