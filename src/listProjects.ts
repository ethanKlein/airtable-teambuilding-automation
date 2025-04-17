import { AirtableService } from './services/airtableService';
import dotenv from 'dotenv';

dotenv.config();

async function listProjects() {
  const airtableService = new AirtableService();
  
  try {
    console.log('Fetching designers from Airtable...');
    const designers = await airtableService.getDesigners();
    
    if (!designers || designers.length === 0) {
      console.log('No designers found.');
      return;
    }

    console.log(`\nFound ${designers.length} designers.`);
    
    // Show all fields from the first record to understand the structure
    if (designers.length > 0) {
      console.log('\nFields available in designer records:');
      const firstDesigner = designers[0];
      Object.keys(firstDesigner.fields || {}).sort().forEach(field => {
        console.log(`- ${field}`);
      });
    }

    console.log('\nFirst 20 designers with their Hub information:');
    designers.slice(0, 20).forEach((designer, index) => {
      const fields = designer.fields || {};
      console.log(`\nDesigner ${index + 1}:`);
      console.log(`Name: ${fields['Name'] || fields['Full Name'] || 'Unnamed'}`);
      console.log(`Hub: ${fields['Hub'] || fields['Location'] || fields['Office'] || 'Not specified'}`);
      
      // Show all fields that might be related to Hub/Location
      Object.entries(fields).forEach(([key, value]) => {
        if (key.toLowerCase().includes('hub') || 
            key.toLowerCase().includes('location') || 
            key.toLowerCase().includes('office') ||
            key.toLowerCase().includes('region')) {
          console.log(`${key}: ${value}`);
        }
      });
    });

    // Collect and show all unique Hub/Location values
    const uniqueLocations = new Set<string>();
    designers.forEach(designer => {
      const fields = designer.fields || {};
      ['Hub', 'Location', 'Office', 'Region'].forEach(field => {
        const value = fields[field];
        if (value) {
          if (Array.isArray(value)) {
            value.forEach(v => uniqueLocations.add(v));
          } else {
            uniqueLocations.add(value);
          }
        }
      });
    });

    console.log('\nUnique Hub/Location values found:');
    Array.from(uniqueLocations).sort().forEach(location => {
      console.log(`- ${location}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

listProjects(); 