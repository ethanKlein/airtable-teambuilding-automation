/**
 * Mock data service to provide simulated assignments data
 * This is used as a fallback when the Airtable API connection fails
 */
export class MockDataService {
  /**
   * Get mock assignments data in the same format as expected from Airtable
   */
  getAssignments(): any[] {
    return [
      {
        id: 'rec1',
        fields: {
          'Title: Designer, Discipline, Journey': 'AJ Mapes VidCom, Director',
          'Home Project (input/automation add)': 'Sigma Alimentos: The Studio (10000121D)',
          'Status': 'Confirmed',
          'Role Type': 'Core',
          'Start Date': '3/31/2025',
          'End Date': '5/16/2025',
          'Project Manager (WO)': ''
        }
      },
      {
        id: 'rec2',
        fields: {
          'Title: Designer, Discipline, Journey': 'Amina Jambo DR, Team',
          'Home Project (input/automation add)': 'IDEO Thinking Page Redesign',
          'Status': 'Confirmed: In Progress',
          'Role Type': 'Core',
          'Start Date': '3/11/2025',
          'End Date': '4/18/2025',
          'Project Manager (WO)': ''
        }
      },
      {
        id: 'rec3',
        fields: {
          'Title: Designer, Discipline, Journey': 'Andreas Yanklow HO, Team',
          'Home Project (input/automation add)': 'Builders Vision - Innovation Engine (100001522)',
          'Status': 'Confirmed',
          'Role Type': 'Core',
          'Start Date': '3/3/2025',
          'End Date': '4/25/2025',
          'Project Manager (WO)': 'Nazlican Goksu'
        }
      },
      {
        id: 'rec4',
        fields: {
          'Title: Designer, Discipline, Journey': 'Angela Kochoska DS, Team',
          'Home Project (input/automation add)': 'Sony SIE Special Project: (TinkerToo) (100001263)',
          'Status': 'Confirmed',
          'Role Type': 'Core',
          'Start Date': '3/31/2025',
          'End Date': '4/25/2025',
          'Project Manager (WO)': 'Cory Seeger'
        }
      },
      {
        id: 'rec5',
        fields: {
          'Title: Designer, Discipline, Journey': 'Anya Shapiro B&D, Team',
          'Home Project (input/automation add)': 'Builders Vision - Innovation Engine (100001522)',
          'Status': 'Confirmed',
          'Role Type': 'Core',
          'Start Date': '3/3/2025',
          'End Date': '4/25/2025',
          'Project Manager (WO)': 'Nazlican Goksu'
        }
      },
      {
        id: 'rec6',
        fields: {
          'Title: Designer, Discipline, Journey': 'Becca Carroll B&D, Enterprise',
          'Home Project (input/automation add)': 'Builders Vision - Innovation Engine (100001522)',
          'Status': 'Confirmed',
          'Role Type': '25%',
          'Start Date': '2/3/2025',
          'End Date': '7/25/2025',
          'Project Manager (WO)': 'Nazlican Goksu'
        }
      },
      {
        id: 'rec7',
        fields: {
          'Title: Designer, Discipline, Journey': 'Bianca Jimenez Rivera DR, Senior Team',
          'Home Project (input/automation add)': 'Sigma Alimentos: The Studio (10000121D)',
          'Status': 'Confirmed',
          'Role Type': 'Core',
          'Start Date': '11/1/2024',
          'End Date': '12/31/2025',
          'Project Manager (WO)': ''
        }
      },
      {
        id: 'rec8',
        fields: {
          'Title: Designer, Discipline, Journey': 'Brian Pelsoh VidCom, Enterprise',
          'Home Project (input/automation add)': 'CalMHSA BHSA Planning Process Redesign (100001548)',
          'Status': 'Confirmed: Opening',
          'Role Type': 'Guide',
          'Start Date': '1/13/2025',
          'End Date': '5/9/2025',
          'Project Manager (WO)': ''
        }
      },
      {
        id: 'rec9',
        fields: {
          'Title: Designer, Discipline, Journey': 'Cory Seeger Env, Director',
          'Home Project (input/automation add)': 'Sony SIE Special Project: (TinkerToo) (100001263)',
          'Status': 'Confirmed',
          'Role Type': 'Core',
          'Start Date': '12/2/2024',
          'End Date': '7/11/2025',
          'Project Manager (WO)': 'Cory Seeger'
        }
      },
      {
        id: 'rec10',
        fields: {
          'Title: Designer, Discipline, Journey': 'Jesse Fourt ME, Enterprise',
          'Home Project (input/automation add)': 'Exact Sciences Cologuard Experience & Product Design',
          'Status': 'Confirmed: Opening',
          'Role Type': 'Guide',
          'Start Date': '2/25/2025',
          'End Date': '7/18/2025',
          'Project Manager (WO)': 'Dyan Lok'
        }
      }
    ];
  }
} 