export class DataTransformer {
  transformRecords(records: any[]): string {
    // Example transformation - customize this based on your Airtable data structure
    const transformedData = records.map(record => {
      return {
        name: record.Name || 'Unnamed',
        status: record.Status || 'Unknown',
        lastUpdated: record.LastUpdated || 'Not specified'
      };
    });

    // Format the data into a readable message
    return this.formatMessage(transformedData);
  }

  private formatMessage(data: any[]): string {
    let message = '*Weekly Update*\n\n';
    
    data.forEach(item => {
      message += `• *${item.name}*: ${item.status} (Last updated: ${item.lastUpdated})\n`;
    });

    return message;
  }

  transformAssignments(assignments: any[]): string {
    // Transform assignments based on the columns from the screengrab
    const transformedData = assignments.map(assignment => {
      return {
        title: assignment['Title: Designer, Discipline, Journey'] || 'Unnamed',
        homeProject: assignment['Home Project (input/automation add)'] || 'Not specified',
        roleType: assignment['Role Type'] || 'Not specified',
        startDate: assignment['Start Date'] || 'Not specified',
        endDate: assignment['End Date'] || 'Not specified',
        projectManager: assignment['Project Manager (WO)'] || ''
      };
    });

    // Format the data into a readable message
    return this.formatAssignmentsMessage(transformedData);
  }

  private formatAssignmentsMessage(assignments: any[]): string {
    // Get the week starting date (next Monday)
    const today = new Date();
    const nextMonday = new Date(today);
    const daysUntilMonday = (7 - today.getDay()) % 7 || 7; // If today is Monday, go to next Monday
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    
    const weekStartDate = nextMonday.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit'
    });

    // Start with a header
    let message = `Projects Week of ${weekStartDate}\n`;
    
    // Group assignments by home project
    const assignmentsByProject: {[key: string]: any[]} = {};
    
    assignments.forEach(assignment => {
      const project = assignment.homeProject;
      if (!assignmentsByProject[project]) {
        assignmentsByProject[project] = [];
      }
      assignmentsByProject[project].push(assignment);
    });
    
    // Add each project with its team members
    for (const [project, projectAssignments] of Object.entries(assignmentsByProject)) {
      message += `${project}`;
      
      // Add team members
      projectAssignments.forEach(assignment => {
        message += ` @${assignment.title.split(',')[0]}`; // Just use the first part of the title (the name)
      });
      
      message += '\n';
    }

    return message;
  }
} 