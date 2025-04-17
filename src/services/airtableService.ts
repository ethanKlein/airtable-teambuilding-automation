// @ts-nocheck
import Airtable from 'airtable';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
}

interface TableRecord {
  id: string;
  name: string;
  [key: string]: any;
}

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

export class AirtableService {
  private base: Airtable.Base;
  private accessToken: string;
  private baseId: string;

  constructor() {
    this.baseId = process.env.AIRTABLE_BASE_ID || '';
    this.accessToken = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || '';

    if (!this.baseId || !this.accessToken) {
      throw new Error('Missing required environment variables: AIRTABLE_BASE_ID or AIRTABLE_PERSONAL_ACCESS_TOKEN');
    }

    console.log('Initializing Airtable with Base ID:', this.baseId);
    this.base = new Airtable({ apiKey: this.accessToken }).base(this.baseId);
  }

  // Diagnostic method to check token and permissions in detail
  async runDiagnostics(): Promise<void> {
    console.log('=========== AIRTABLE API DIAGNOSTICS ===========');
    console.log(`Token starts with: ${this.accessToken.substring(0, 10)}...`);
    console.log(`Token length: ${this.accessToken.length} characters`);
    console.log(`Base ID: ${this.baseId}`);
    
    // Check if token starts with correct prefix
    if (!this.accessToken.startsWith('pat.')) {
      console.log('WARNING: Your token does not start with "pat." which is required for personal access tokens.');
    }

    // 1. Test generic API access
    try {
      console.log('\nTesting basic API access...');
      const response = await axios.get('https://api.airtable.com/v0/meta/whoami', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      
      console.log('✓ API access successful!');
      console.log('User ID:', response.data.id);
    } catch (error: any) {
      console.log('✗ API access failed!');
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log('Error:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }
    
    // 2. Test user bases
    try {
      console.log('\nFetching accessible bases...');
      const response = await axios.get('https://api.airtable.com/v0/meta/bases', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      
      console.log('✓ Bases access successful!');
      const bases = response.data.bases || [];
      console.log(`Found ${bases.length} accessible bases`);
      
      // Check if our base is in the list
      const ourBase = bases.find((base: any) => base.id === this.baseId);
      if (ourBase) {
        console.log(`✓ Found our base: ${ourBase.name} (${ourBase.id})`);
      } else {
        console.log(`✗ Our base ID ${this.baseId} is NOT in the list of accessible bases!`);
        console.log('Available bases:');
        bases.forEach((base: any) => {
          console.log(`- ${base.name} (${base.id})`);
        });
      }
    } catch (error: any) {
      console.log('✗ Bases access failed!');
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log('Error:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }
    
    // 3. Try to directly access the base
    try {
      console.log(`\nDirectly accessing base ${this.baseId}...`);
      const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${this.baseId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      
      console.log('✓ Base access successful!');
      console.log(`Base name: ${response.data.name}`);
      
      // Try to get the first table
      if (response.data.tables && response.data.tables.length > 0) {
        const firstTable = response.data.tables[0];
        console.log(`First table: ${firstTable.name} (${firstTable.id})`);
        
        // Try to access this table
        try {
          console.log(`\nAccessing table ${firstTable.id}...`);
          const tableResponse = await axios.get(`https://api.airtable.com/v0/${this.baseId}/${firstTable.id}?maxRecords=1`, {
            headers: {
              Authorization: `Bearer ${this.accessToken}`
            }
          });
          
          console.log('✓ Table access successful!');
          console.log(`Retrieved ${tableResponse.data.records.length} records`);
        } catch (tableError: any) {
          console.log('✗ Table access failed!');
          if (tableError.response) {
            console.log(`Status: ${tableError.response.status}`);
            console.log('Error:', tableError.response.data);
          } else {
            console.log('Error:', tableError.message);
          }
        }
      }
    } catch (error: any) {
      console.log('✗ Base access failed!');
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log('Error:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }
    
    console.log('\n=================================================');
    console.log('RECOMMENDATIONS:');
    console.log('1. Make sure your personal access token starts with "pat."');
    console.log('2. Check that you have explicitly granted access to this specific base in your token settings');
    console.log('3. Verify that the Base ID is correct');
    console.log('4. Try creating a new token with all scope permissions and "all bases" access');
    console.log('=================================================');
  }

  // Try to access the base schema using the Meta API endpoint
  async getBaseSchema(): Promise<any> {
    try {
      const url = `https://api.airtable.com/v0/meta/bases/${this.baseId}/tables`;
      console.log(`Getting base schema from: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      
      console.log(`Schema API response status: ${response.status}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting base schema:', error.message);
      
      // If there's a response object in the error, log it
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      
      throw error;
    }
  }

  // Get all tables in the base
  async listTables(): Promise<TableRecord[]> {
    try {
      const url = `https://api.airtable.com/v0/meta/bases/${this.baseId}/tables`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      
      if (response.data && response.data.tables) {
        return response.data.tables.map(table => table);
      }
      
      return [];
    } catch (error) {
      console.error('Error listing tables:', error);
      throw error;
    }
  }

  // Try to access the first available table with records
  async findAccessibleTable(): Promise<{ tableName: string, tableId: string } | null> {
    try {
      // First try to get schema
      try {
        const tables = await this.listTables();
        
        // If we found tables via schema, use the first one
        if (tables.length > 0) {
          return {
            tableName: tables[0].name,
            tableId: tables[0].id
          };
        }
      } catch (schemaError) {
        console.log('Could not access schema API, trying alternative methods...');
      }
      
      // Try some common table names
      const commonTableNames = [
        process.env.AIRTABLE_TABLE_NAME,
        'Current Assignments',
        'Table 1',
        'Community Teambuilding Portal'
      ];
      
      for (const tableName of commonTableNames) {
        if (!tableName) continue;
        
        try {
          console.log(`Trying to access table: "${tableName}"`);
          
          // Try to get one record from this table
          const url = `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(tableName)}?maxRecords=1`;
          
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${this.accessToken}`
            }
          });
          
          if (response.status === 200) {
            console.log(`Found accessible table: "${tableName}"`);
            return { tableName, tableId: tableName };
          }
        } catch (tableError) {
          // Continue to the next table name
        }
      }
      
      console.log('Could not find any accessible tables');
      return null;
    } catch (error) {
      console.error('Error finding accessible table:', error);
      return null;
    }
  }

  // Get assignments from the first accessible table
  async getAssignments(): Promise<any[]> {
    try {
      console.log('Fetching assignments from the Current Assignments table...');
      const records = await this.base('Current Assignments').select().all();
      console.log(`Successfully retrieved ${records.length} assignments`);
      return records.map(record => ({
        id: record.id,
        ...record.fields
      }));
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  async getRecordsFromTable(tableName: string): Promise<any[]> {
    try {
      const records = await this.base(tableName).select().all();
      return records.map(record => ({
        id: record.id,
        ...record.fields
      }));
    } catch (error) {
      console.error(`Error fetching records from ${tableName}:`, error);
      throw error;
    }
  }

  async getProjects(): Promise<any[]> {
    try {
      console.log('Fetching projects directly from API...');
      let allRecords = [];
      let offset = undefined;
      
      do {
        const url = `https://api.airtable.com/v0/${this.baseId}/Home%20Project`;
        const params: any = { pageSize: 100 };
        if (offset) {
          params.offset = offset;
        }
        
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          },
          params
        });
        
        if (response.data && response.data.records) {
          allRecords = [...allRecords, ...response.data.records];
          offset = response.data.offset;
        } else {
          break;
        }
      } while (offset);
      
      console.log(`Successfully retrieved ${allRecords.length} projects`);
      return allRecords;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getRelatedRecords(tableName: string, fieldName: string, recordIds: string[]): Promise<any[]> {
    try {
      const records = await this.base(tableName)
        .select({
          filterByFormula: `OR(${recordIds.map(id => `RECORD_ID()='${id}'`).join(',')})`
        })
        .all();

      return records.map(record => ({
        id: record.id,
        ...record.fields
      }));
    } catch (error) {
      console.error(`Error fetching related records from ${tableName}:`, error);
      throw error;
    }
  }

  public async getDesigners(): Promise<Airtable.Records<any>> {
    console.log('Fetching designers from Airtable...');
    try {
      let allRecords = [];
      let offset = undefined;
      
      do {
        const url = `https://api.airtable.com/v0/${this.baseId}/tbl5Gp0pm8poBMjMi`;
        const params: any = { pageSize: 100 };
        if (offset) {
          params.offset = offset;
        }
        
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          },
          params
        });
        
        if (response.data && response.data.records) {
          allRecords = [...allRecords, ...response.data.records];
          offset = response.data.offset;
        } else {
          break;
        }
      } while (offset);
      
      console.log(`Successfully retrieved ${allRecords.length} designers`);
      return allRecords;
    } catch (error) {
      console.error('Error fetching designers:', error);
      throw error;
    }
  }

  async getTables(): Promise<Table[]> {
    const tables = await this.base.tables.list();
    return tables.map(table => ({
      id: table.id,
      name: table.name,
      primaryFieldId: table.primaryFieldId
    }));
  }

  async getFields(tableId: string): Promise<Field[]> {
    const table = this.base.table(tableId);
    const fields = await table.fields.list();
    return fields.map(field => ({
      id: field.id,
      name: field.name,
      type: field.type,
      options: field.options
    }));
  }

  async getViews(tableId: string): Promise<View[]> {
    const table = this.base.table(tableId);
    const views = await table.views.list();
    return views.map(view => ({
      id: view.id,
      name: view.name,
      type: view.type
    }));
  }
} 