import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const targetBaseId = 'appo6sffgxsVs5PYS';

async function testAirtableAuth() {
  const accessToken = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || '';

//   if (!accessToken.startsWith('pat.')) {
//     console.log('Invalid token format. Ensure it starts with "pat."');
//     return;
//   }

  try {
    console.log('Testing API access...');
    const response = await axios.get('https://api.airtable.com/v0/meta/bases', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    console.log('API access successful! Accessible bases:');
    const accessibleBaseIds = response.data.bases.map((base: any) => base.id);
    response.data.bases.forEach((base: any) => {
      console.log(`- ${base.name} (ID: ${base.id})`);
    });

    console.log('Accessible Base IDs:', accessibleBaseIds.join(', '));

    const targetBase = response.data.bases.find((base: any) => base.id === targetBaseId);
    if (targetBase) {
      console.log(`The base ID ${targetBaseId} is accessible. Base name: ${targetBase.name}`);
    } else {
      console.log(`The base ID ${targetBaseId} is NOT accessible.`);
    }
  } catch (error: any) {
    console.log('API access failed!');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testAirtableAuth(); 