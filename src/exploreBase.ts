import { AirtableService } from './services/airtableService';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

interface Table {
  id: string;
  name: string;
  primaryFieldId: string;
}

interface Field {
  id: string;
  name: string;
  type: string;
  options?: any;
}

interface View {
  id: string;
  name: string;
  type: string;
}

async function exploreBase() {
  try {
    const airtableService = new AirtableService();
    const baseId = process.env.AIRTABLE_BASE_ID;
    const accessToken = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
    
    if (!baseId || !accessToken) {
      throw new Error('Missing required environment variables');
    }

    console.log('🔍 Exploring Airtable Base Structure...\n');
    
    // Get base metadata using REST API
    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const tables = response.data.tables;
    console.log(`Found ${tables.length} tables:\n`);
    
    // For each table, get its fields and configuration
    for (const table of tables) {
      console.log(`📋 Table: ${table.name}`);
      console.log(`   ID: ${table.id}`);
      console.log(`   Primary Field: ${table.primaryFieldId}`);
      console.log('\n   Fields:');
      
      table.fields.forEach((field: Field) => {
        console.log(`   - ${field.name} (${field.type})`);
        if (field.options) {
          console.log('     Options:', JSON.stringify(field.options, null, 2));
        }
      });
      
      console.log('\n   Views:');
      table.views.forEach((view: View) => {
        console.log(`   - ${view.name} (${view.type})`);
      });
      
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
  } catch (error) {
    console.error('Error exploring base:', error);
  }
}

exploreBase(); 