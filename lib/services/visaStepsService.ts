import visaStepsConfig from '@/data/visaStepsConfig.json';

export interface StepConfig {
  id: number | string;
  title: string;
  description: string;
  icon: string;
  tasks: string[];
  documents?: string[];
  isRequired: boolean;
  estimatedDuration: string;
  tips?: string[];
  requiredForCountries?: string[];
  requiredForStatus?: string[];
}

export type UserStatus = 'tourist' | 'worker' | 'student' | 'resident';

class VisaStepsService {
  
  /**
   * Génère les étapes personnalisées selon le statut utilisateur et le pays
   */
  generateStepsForUser(status: UserStatus, countryCode: string): StepConfig[] {
    const steps: StepConfig[] = [];
    
    // 1. Ajouter les étapes spécifiques au statut
    const statusSteps = visaStepsConfig.stepsByStatus[status] || [];
    steps.push(...statusSteps);
    
    // 2. Vérifier si un test de langue est requis
    const countryRequirements = visaStepsConfig.countrySpecificRequirements[countryCode as keyof typeof visaStepsConfig.countrySpecificRequirements];
    const languageTestStep = visaStepsConfig.commonSteps.languageTest;
    
    if (this.isLanguageTestRequired(status, countryCode)) {
      steps.push({
        ...languageTestStep,
        id: steps.length + 1
      });
    }
    
    // 3. Ajouter les étapes visa communes si visa requis
    if (this.isVisaRequired(countryCode)) {
      const commonSteps = [
        visaStepsConfig.commonSteps.visaDocuments,
        visaStepsConfig.commonSteps.visaSubmission,
        visaStepsConfig.commonSteps.visaTracking
      ];
      
      commonSteps.forEach(step => {
        steps.push({
          ...step,
          id: steps.length + 1
        });
      });
    }
    
    // 4. Ajouter les exigences spécifiques au pays
    if (countryRequirements) {
      if (countryRequirements.medicalExam) {
        steps.splice(-2, 0, {
          id: steps.length,
          title: 'Examen médical',
          description: 'Passez l\'examen médical requis',
          icon: 'Heart',
          tasks: [
            'Prendre rendez-vous avec un médecin agréé',
            'Passer l\'examen médical complet',
            'Obtenir le certificat médical',
            'Soumettre les résultats'
          ],
          documents: ['Certificat médical officiel', 'Résultats d\'analyses'],
          isRequired: true,
          estimatedDuration: '1-2 semaines'
        });
      }
      
      if (countryRequirements.biometrics) {
        steps.splice(-1, 0, {
          id: steps.length,
          title: 'Données biométriques',
          description: 'Fournissez vos données biométriques',
          icon: 'Fingerprint',
          tasks: [
            'Prendre rendez-vous au centre biométrique',
            'Se présenter avec les documents requis',
            'Fournir empreintes et photo',
            'Obtenir la confirmation'
          ],
          isRequired: true,
          estimatedDuration: '1 jour'
        });
      }
    }
    
    return steps.map((step, index) => ({
      ...step,
      id: index + 1
    }));
  }
  
  /**
   * Vérifie si un test de langue est requis
   */
  private isLanguageTestRequired(status: UserStatus, countryCode: string): boolean {
    const languageTestStep = visaStepsConfig.commonSteps.languageTest;
    
    // Vérifier si le statut nécessite un test de langue
    if (!languageTestStep.requiredForStatus?.includes(status)) {
      return false;
    }
    
    // Vérifier si le pays nécessite un test de langue
    return languageTestStep.requiredForCountries?.includes(countryCode) || false;
  }
  
  /**
   * Vérifie si un visa est requis pour le pays
   */
  private isVisaRequired(countryCode: string): boolean {
    // Liste des pays sans visa (exemple)
    const noVisaCountries = ['FR', 'SN', 'ML', 'CI', 'BF', 'MA', 'TN'];
    return !noVisaCountries.includes(countryCode);
  }
  
  /**
   * Obtient les conseils spécifiques pour une étape
   */
  getStepTips(stepId: number, status: UserStatus, countryCode: string): string[] {
    const tips: string[] = [];
    
    // Conseils généraux selon le statut
    switch (status) {
      case 'student':
        tips.push(
          'Commencez vos démarches 12-18 mois avant la rentrée',
          'Gardez toujours des copies de tous vos documents',
          'Contactez les services d\'admission pour toute question'
        );
        break;
      case 'worker':
        tips.push(
          'Adaptez votre CV aux standards locaux',
          'Préparez-vous aux entretiens en ligne',
          'Vérifiez les exigences de certification professionnelle'
        );
        break;
      case 'resident':
        tips.push(
          'Tous les documents doivent être récents (moins de 6 mois)',
          'Préparez des preuves solides de votre relation',
          'Consultez un avocat spécialisé si nécessaire'
        );
        break;
      case 'tourist':
        tips.push(
          'Réservez des hébergements annulables',
          'Gardez des preuves de fonds suffisants',
          'Vérifiez la validité de votre passeport'
        );
        break;
    }
    
    // Conseils spécifiques au pays
    const countryTips = this.getCountrySpecificTips(countryCode);
    tips.push(...countryTips);
    
    return tips;
  }
  
  /**
   * Obtient les conseils spécifiques au pays
   */
  private getCountrySpecificTips(countryCode: string): string[] {
    const tips: { [key: string]: string[] } = {
      'CA': [
        'Le processus peut prendre plusieurs mois',
        'Préparez un budget conséquent pour les frais',
        'L\'examen médical est obligatoire'
      ],
      'AU': [
        'Le système de points est complexe',
        'L\'évaluation des compétences est cruciale',
        'Préparez-vous à l\'examen IELTS'
      ],
      'US': [
        'L\'entretien consulaire est obligatoire',
        'Préparez des preuves de liens avec votre pays',
        'Les délais peuvent être très longs'
      ],
      'GB': [
        'Le test de tuberculose peut être requis',
        'Préparez un budget pour les frais élevés',
        'L\'anglais est généralement requis'
      ],
      'FR': [
        'L\'attestation d\'hébergement est souvent requise',
        'Les justificatifs financiers sont importants',
        'Respectez scrupuleusement les rendez-vous'
      ]
    };
    
    return tips[countryCode] || [];
  }
  
  /**
   * Calcule la durée totale estimée du processus
   */
  calculateTotalDuration(steps: StepConfig[]): string {
    // Logique simplifiée - en réalité, certaines étapes peuvent être parallèles
    const totalWeeks = steps.reduce((total, step) => {
      const duration = step.estimatedDuration;
      const weeks = this.parseDuration(duration);
      return total + weeks;
    }, 0);
    
    if (totalWeeks < 4) {
      return `${totalWeeks} semaines`;
    } else {
      const months = Math.ceil(totalWeeks / 4);
      return `${months} mois`;
    }
  }
  
  /**
   * Parse la durée en semaines
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)(?:-(\d+))?\s*(semaines?|mois)/);
    if (!match) return 1;
    
    const min = parseInt(match[1]);
    const max = match[2] ? parseInt(match[2]) : min;
    const unit = match[3];
    
    const average = (min + max) / 2;
    
    if (unit.includes('mois')) {
      return average * 4; // 4 semaines par mois
    }
    
    return average;
  }
  
  /**
   * Obtient les documents requis pour un statut et pays
   */
  getRequiredDocuments(status: UserStatus, countryCode: string): string[] {
    const documents: string[] = [];
    const steps = this.generateStepsForUser(status, countryCode);
    
    steps.forEach(step => {
      if (step.documents) {
        documents.push(...step.documents);
      }
    });
    
    // Supprimer les doublons
    return [...new Set(documents)];
  }
  
  /**
   * Vérifie si une étape est critique (bloquante)
   */
  isStepCritical(stepId: number, status: UserStatus): boolean {
    const criticalSteps = {
      'student': [1, 2, 4], // Université, test langue, admission
      'worker': [1, 2], // Emploi, validation compétences
      'resident': [1], // Dossier complet
      'tourist': [1] // Planification
    };
    
    return criticalSteps[status]?.includes(stepId) || false;
  }
}

export const visaStepsService = new VisaStepsService();