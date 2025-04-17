import cron from 'node-cron';
import { AirtableService } from './services/airtableService';
import { SlackService } from './services/slackService';
import { DataTransformer } from './services/dataTransformer';
import { MockDataService } from './services/mockDataService';
import dotenv from 'dotenv';

dotenv.config();

class WeeklyAutomation {
  private airtableService: AirtableService;
  private mockDataService: MockDataService;
  private slackService: SlackService;
  private dataTransformer: DataTransformer;
  private useMockData: boolean;

  constructor(useMockData = false) {
    this.airtableService = new AirtableService();
    this.mockDataService = new MockDataService();
    this.slackService = new SlackService();
    this.dataTransformer = new DataTransformer();
    this.useMockData = useMockData;
  }

  async runAutomation(testMode: boolean = false): Promise<void> {
    try {
      if (testMode) {
        console.log('Running in test mode...');
        
        // List projects
        const projects = await this.airtableService.getProjects();
        console.log(`\nFound ${projects.length} projects`);
        projects.slice(0, 5).forEach(project => {
          console.log(`\nProject: ${project.fields['Project Name (Editable)']}`);
          console.log('Region:', project.fields['Region (WD)']);
        });
        
        // List designers
        const designers = await this.airtableService.getDesigners();
        console.log(`\nFound ${designers.length} designers`);
        designers.slice(0, 5).forEach(designer => {
          console.log(`\nDesigner: ${designer.fields['Name']}`);
        });
        
        return;
      }
      const projects = await this.airtableService.getProjects();
      // console.log(`Found ${projects.length} projects`);
      
      // Debug: Show the structure of the first project
      if (projects.length > 0) {
        // console.log('\nSample project structure:');
        // console.log(JSON.stringify(projects[0], null, 2));
      }
      
      // console.log('\nSF Hub Projects and Their Teams:');
      for (const project of projects) {
        const fields = project.fields || {};
        const region = fields['Region (WD)']?.[0];
        
        // Check if this is an SF project (North America region)
        if (region === 'North America') {
          const projectName = fields['Project Name (Editable)'] || 'Unnamed Project';
          const designers = fields['Locked Designers'] || [];
          
          // console.log(`\nProject: ${projectName}`);
          if (designers.length > 0) {
            // console.log('Team Members:');
            for (const designerId of designers) {
              // console.log(`- ${designerId}`);
            }
          } else {
            // console.log('No team members assigned');
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async testAirtableConnection(): Promise<void> {
    try {
      console.log('Testing Airtable connection...');
      
      // First try to get schema information
      try {
        console.log('Attempting to get base schema...');
        const tables = await this.airtableService.listTables();
        console.log(`Found ${tables.length} tables via schema API`);
      } catch (schemaError) {
        console.log('Could not access schema. This is okay, we can try direct access.');
      }
      
      // Then try to get assignments
      const assignments = await this.airtableService.getAssignments();
      console.log(`Connection successful! Retrieved ${assignments.length} assignments.`);
      
      // Print sample data
      if (assignments.length > 0) {
        console.log('Sample record fields:');
        const sampleFields = Object.keys(assignments[0].fields || {});
        console.log(sampleFields);
      }
    } catch (error) {
      console.error('Error testing Airtable connection:', error);
      
      console.log('\nFallback to Mock Data:');
      const mockAssignments = this.mockDataService.getAssignments();
      console.log(`Generated ${mockAssignments.length} mock assignments that can be used as fallback`);
      
      if (mockAssignments.length > 0) {
        console.log('\nSample mock record:');
        const sampleRecord = mockAssignments[0];
        console.log('ID:', sampleRecord.id);
        console.log('Fields:', Object.keys(sampleRecord.fields));
      }
    }
  }

  async testSlackIntegration(): Promise<void> {
    try {
      console.log('Testing Slack integration with mock data...');
      
      // Use mock data
      const assignments = this.mockDataService.getAssignments();
      
      // Transform the data
      const message = this.dataTransformer.transformAssignments(assignments);
      
      // Send to Slack
      await this.slackService.sendMessage(message);
      
      console.log('Successfully sent mock data to Slack!');
    } catch (error) {
      console.error('Error testing Slack integration:', error);
    }
  }

  async listTables(): Promise<void> {
    try {
      console.log('Listing all tables in the base...');
      const tables = await this.airtableService.listTables();
      console.log('Tables found:');
      tables.forEach((table: any) => {
        console.log(`- ${table.name}`);
      });
    } catch (error) {
      console.error('Error listing tables:', error);
    }
  }

  async listDesigners(): Promise<void> {
    try {
      console.log('Fetching designers from Airtable...');
      const designers = await this.airtableService.getDesigners();
      console.log('Designers found:');
      designers.forEach((designer: any, index: number) => {
        console.log(`Designer ${index + 1}:`);
        Object.entries(designer.fields || {}).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      });
    } catch (error) {
      console.error('Error fetching designers:', error);
    }
  }

  async checkTableAccess(): Promise<void> {
    try {
      console.log('Checking table access...');
      const tables = await this.airtableService.listTables();
      
      // Print just table names
      console.log('\nAvailable tables:');
      tables.forEach((table: any) => {
        console.log(`- ${table.name}`);
      });
      
      // Try specific tables we're interested in
      const targetTables = ['Home Project', 'Projects', 'Current Assignments'];
      for (const tableName of targetTables) {
        try {
          console.log(`\nTrying to access ${tableName}...`);
          const records = await this.airtableService.getRecordsFromTable(tableName);
          console.log(`Found ${records.length} records in ${tableName}`);
          if (records.length > 0) {
            console.log('Available fields:', Object.keys(records[0].fields));
          }
        } catch (error: any) {
          console.log(`Failed to access ${tableName}: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Error checking table access:', error);
    }
  }

  async listRegions(): Promise<void> {
    try {
      console.log('\n=== Analyzing Region Fields ===');
      const projects = await this.airtableService.getProjects();
      
      if (projects.length > 0) {
        console.log('\nFirst project fields:');
        const firstProject = projects[0];
        const regionFields = Object.keys(firstProject.fields).filter(field => 
          field.toLowerCase().includes('region') || 
          field.toLowerCase().includes('hub') ||
          field.toLowerCase().includes('location')
        );
        
        regionFields.forEach(field => {
          console.log(`\nField: "${field}"`);
          console.log(`Value: ${JSON.stringify(firstProject.fields[field])}`);
        });
        
        // Get all unique values for region fields
        console.log('\n=== Unique Values by Region Field ===');
        regionFields.forEach(field => {
          const values = new Set<string>();
          projects.forEach(project => {
            const value = project.fields[field];
            if (value) {
              if (Array.isArray(value)) {
                value.forEach(v => values.add(v));
              } else {
                values.add(value);
              }
            }
          });
          
          console.log(`\nField: "${field}"`);
          console.log('Unique values:');
          values.forEach(value => console.log(`- "${value}"`));
        });
      }
    } catch (error) {
      console.error('Error analyzing regions:', error);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const testMode = args.includes('--test');
const useMockData = args.includes('--use-mock');

// Create instance
const automation = new WeeklyAutomation(useMockData);

// Run in test mode if specified
if (testMode) {
  automation.runAutomation(true).catch(console.error);
} else {
  // Schedule the automation to run weekly
  cron.schedule('0 9 * * 1', async () => {
    await automation.runAutomation();
  });

  // Run immediately
  automation.runAutomation().catch(console.error);
} 