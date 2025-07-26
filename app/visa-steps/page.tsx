'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Circle, 
  Upload, 
  Download, 
  MessageCircle, 
  FileText, 
  Search, 
  Edit, 
  Send, 
  Clock,
  AlertCircle,
  Sparkles,
  Star,
  Globe,
  Shield,
  Zap,
  GraduationCap,
  Briefcase,
  Home,
  User,
  Heart,
  Fingerprint,
  Award,
  MapPin,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { visaStepsService, type UserStatus, type StepConfig } from '@/lib/services/visaStepsService';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  status: 'uploaded' | 'pending' | 'approved';
}

const iconMap: { [key: string]: any } = {
  GraduationCap,
  Briefcase,
  Home,
  User,
  MessageCircle,
  FileText,
  Send,
  Clock,
  Heart,
  Fingerprint,
  Award,
  MapPin,
  Star,
  Globe,
  Shield
};

function VisaStepsContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>('tourist');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [steps, setSteps] = useState<StepConfig[]>([]);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      nationality: '',
      passportNumber: '',
      dateOfBirth: '',
      placeOfBirth: ''
    },
    statusSpecific: {
      // Pour étudiants
      university: '',
      program: '',
      admissionLetter: false,
      languageTest: '',
      
      // Pour travailleurs
      jobOffer: '',
      employer: '',
      workPermit: false,
      skillsAssessment: '',
      
      // Pour résidents
      sponsorInfo: '',
      relationshipProof: '',
      financialSupport: '',
      
      // Général
      accommodation: '',
      financialProof: '',
      healthInsurance: ''
    }
  });
  const { user, isAuthenticated, loading } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      const countryCode = searchParams.get('country');
      try {
        // Tentative de récupération via le service
        const countriesData = await visaStepsService.getCountries();
        const country = countriesData.find(c => c.code === countryCode) || countriesData[0];
        setSelectedCountry(country);
      } catch (error) {
        console.error('Erreur avec le backend pour les pays, utilisation du fichier local:', error);
        const countries = (await import('@/data/countries.json')).default;
        const country = countries.find(c => c.code === countryCode) || countries[0];
        setSelectedCountry(country);
      }

      // ✅ Charger la progression sauvegardée (avec conversion des dates)
      if (user) {
        try {
          const progress = await visaStepsService.getUserProgress(user.id, countryCode || '');
          if (progress) {
            setCurrentStep(progress.currentStep || 1);
            setCompletedSteps(progress.completedSteps || []);
            setFormData(progress.formData || formData);
            const documentsWithParsedDates = (progress.documents || []).map((doc: any) => ({
              ...doc,
              uploadDate: new Date(doc.uploadDate),
            }));
            setDocuments(documentsWithParsedDates);
            setUserStatus(progress.userStatus || 'tourist');
          }
        } catch (error) {
          console.error('Erreur avec le backend pour la progression, utilisation du fallback local:', error);
          const savedProgress = localStorage.getItem('visaProgress');
          if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            setCurrentStep(progress.currentStep || 1);
            setCompletedSteps(progress.completedSteps || []);
            setFormData(progress.formData || formData);
            const documentsWithParsedDates = (progress.documents || []).map((doc: any) => ({
              ...doc,
              uploadDate: new Date(doc.uploadDate),
            }));
            setDocuments(documentsWithParsedDates);
            setUserStatus(progress.userStatus || 'tourist');
          }
        }
      }
    };
    fetchData();
  }, [searchParams, user]);

  useEffect(() => {
    if (selectedCountry) {
      const fetchSteps = async () => {
        try {
          const generatedSteps = await visaStepsService.generateStepsForUser(userStatus, selectedCountry.code);
          setSteps(generatedSteps);
        } catch (error) {
          console.error('Erreur avec le backend pour les étapes, utilisation du fallback local:', error);
          // Pas de fichier .json pour les étapes dans l'implémentation originale, donc on laisse vide
          setSteps([]);
        }
      };
      fetchSteps();
    }
  }, [selectedCountry, userStatus]);

  // Vérification d'accès sans redirection automatique
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-32 w-32 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-lg shadow-lg">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Connexion requise
          </h1>
          <p className="text-muted-foreground mb-6">
            Vous devez être connecté pour accéder aux démarches de visa.
          </p>
          <Button asChild>
            <a href="/countries">Retour aux destinations</a>
          </Button>
        </div>
      </div>
    );
  }

  const saveProgress = async () => {
    const progress = {
      currentStep,
      completedSteps,
      formData,
      documents,
      userStatus,
      countryCode: selectedCountry?.code
    };
    try {
      if (user) {
        await visaStepsService.saveUserProgress(user.id, progress);
      }
    } catch (error) {
      console.error('Erreur avec le backend pour sauvegarder la progression, utilisation du fallback local:', error);
      localStorage.setItem('visaProgress', JSON.stringify(progress));
    }
  };

  const handleStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
    
    if (stepNumber < steps.length) {
      setCurrentStep(stepNumber + 1);
    } else {
      // Toutes les étapes sont terminées, rediriger vers l'intégration
      toast.success('Félicitations ! Toutes les étapes sont terminées. Vous pouvez maintenant passer à l\'intégration.');
      setTimeout(() => {
        window.location.href = '/integration';
      }, 2000);
      return;
    }
    
    saveProgress();
    toast.success(`Étape ${stepNumber} terminée !`);
  };

  const resetProgress = async () => {
    if (user) {
      try {
        await visaStepsService.resetUserProgress(user.id);
      } catch (error) {
        console.error('Erreur avec le backend pour réinitialiser la progression, utilisation du fallback local:', error);
        localStorage.removeItem('visaProgress');
      }
    }
    setCurrentStep(1);
    setCompletedSteps([]);
    setFormData({
      personalInfo: {
        firstName: '',
        lastName: '',
        nationality: '',
        passportNumber: '',
        dateOfBirth: '',
        placeOfBirth: ''
      },
      statusSpecific: {
        university: '',
        program: '',
        admissionLetter: false,
        languageTest: '',
        jobOffer: '',
        employer: '',
        workPermit: false,
        skillsAssessment: '',
        sponsorInfo: '',
        relationshipProof: '',
        financialSupport: '',
        accommodation: '',
        financialProof: '',
        healthInsurance: ''
      }
    });
    setDocuments([]);
    toast.success('Progression réinitialisée');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Le fichier doit faire moins de 10MB');
        return;
      }

      const newDocument: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date(),
        status: 'uploaded'
      };

      setDocuments(prev => [...prev, newDocument]);
      toast.success(`${file.name} téléchargé avec succès`);
    });

    saveProgress();
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    saveProgress();
    toast.success('Document supprimé');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProgressPercentage = () => {
    return (completedSteps.length / steps.length) * 100;
  };

  const currentStepData = steps.find(step => step.id === currentStep);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'student': return GraduationCap;
      case 'worker': return Briefcase;
      case 'resident': return Home;
      default: return User;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'student': return 'Étudiant';
      case 'worker': return 'Travailleur';
      case 'resident': return 'Résident permanent';
      default: return 'Touriste';
    }
  };

  const getStepIcon = (iconName: string) => {
    return iconMap[iconName] || Circle;
  };

  const totalDuration = visaStepsService.calculateTotalDuration(steps);
  const stepTips = currentStepData ? visaStepsService.getStepTips(currentStep, userStatus, selectedCountry?.code || '') : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Link href="/countries" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Link>
              </Button>
              
              {selectedCountry && (
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{selectedCountry.flag}</span>
                  <div>
                    <h1 className="text-xl font-bold">
                      Démarches - {selectedCountry.name}
                    </h1>
                    <p className="text-sm text-primary-foreground/80">
                      Étape {currentStep} sur {steps.length} • {getStatusLabel(userStatus)} • Durée estimée: {totalDuration}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold">{Math.round(getProgressPercentage())}%</div>
              <div className="text-sm text-primary-foreground/80">Progression</div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Selector */}
      <section className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Label htmlFor="status">Votre statut :</Label>
              <Select value={userStatus} onValueChange={(value: UserStatus) => {
                setUserStatus(value);
                setCurrentStep(1);
                setCompletedSteps([]);
                saveProgress();
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourist">🏖️ Touriste</SelectItem>
                  <SelectItem value="student">🎓 Étudiant</SelectItem>
                  <SelectItem value="worker">💼 Travailleur</SelectItem>
                  <SelectItem value="resident">🏠 Résident permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Documents requis: {visaStepsService.getRequiredDocuments(userStatus, selectedCountry?.code || '').length}
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <Progress value={getProgressPercentage()} className="h-3" />
            
            <div className="flex items-center justify-between overflow-x-auto">
              {steps.map((step, index) => {
                const StepIcon = getStepIcon(step.icon);
                const isCompleted = completedSteps.includes(step.id as number);
                const isCurrent = currentStep === step.id;
                const isCritical = visaStepsService.isStepCritical(step.id as number, userStatus);
                
                return (
                  <div key={step.id} className="flex flex-col items-center space-y-2 min-w-0 flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 relative ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isCurrent 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'bg-background border-border text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                      {isCritical && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                      )}
                    </div>
                    
                    <div className="text-center">
                      <p className={`text-sm font-medium ${
                        isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.estimatedDuration}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step Content */}
            <div className="lg:col-span-2">
              {currentStepData && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {React.createElement(getStepIcon(currentStepData.icon), { 
                        className: "h-6 w-6 mr-3 text-primary" 
                      })}
                      {currentStepData.title}
                      {visaStepsService.isStepCritical(currentStep, userStatus) && (
                        <Badge variant="destructive" className="ml-2">Critique</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">{currentStepData.description}</p>

                    {currentStepData.isRequired && (
                      <Alert className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Cette étape est obligatoire pour continuer votre démarche.
                          {visaStepsService.isStepCritical(currentStep, userStatus) && 
                            " Cette étape est critique et peut bloquer tout le processus si elle n'est pas complétée correctement."
                          }
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Tips spécifiques */}
                    {stepTips.length > 0 && (
                      <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Conseils :</strong>
                          <ul className="mt-2 space-y-1">
                            {stepTips.slice(0, 3).map((tip, index) => (
                              <li key={index} className="text-sm">• {tip}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Tâches à accomplir</h3>
                      {currentStepData.tasks.map((task, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                          <Circle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{task}</span>
                        </div>
                      ))}
                    </div>

                    {currentStepData.documents && (
                      <div className="mt-6 space-y-4">
                        <h3 className="text-lg font-semibold">Documents requis</h3>
                        {currentStepData.documents.map((doc, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className="text-muted-foreground">{doc}</span>
                          </div>
                        ))}

                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h4 className="text-lg font-semibold mb-2">Télécharger vos documents</h4>
                          <p className="text-muted-foreground mb-4">
                            Formats acceptés: PDF, JPG, PNG (max 10MB par fichier)
                          </p>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                          <Button asChild>
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Sélectionner les fichiers
                            </label>
                          </Button>
                        </div>

                        {documents.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold">Documents téléchargés</h4>
                            {documents.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-5 w-5 text-primary" />
                                  <div>
                                    <div className="font-medium">{doc.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatFileSize(doc.size)} • {doc.uploadDate.toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={doc.status === 'uploaded' ? 'default' : 'secondary'}>
                                    {doc.status === 'uploaded' ? 'Téléchargé' : 'En attente'}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDocument(doc.id)}
                                  >
                                    Supprimer
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4 mt-6">
                      {currentStep > 1 && (
                        <Button 
                          variant="outline"
                          onClick={() => setCurrentStep(currentStep - 1)}
                          className="flex-1"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Étape précédente
                        </Button>
                      )}
                      
                      <Button 
                        onClick={() => handleStepComplete(currentStep)}
                        className="flex-1"
                        disabled={currentStepData.documents && documents.length === 0}
                      >
                        {currentStep === steps.length ? 'Terminer' : 'Marquer comme terminé'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Assistant */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Assistant IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Besoin d'aide ? Posez vos questions à l'assistant IA.
                  </p>
                  <div className="space-y-3">
                    <Textarea 
                      placeholder="Tapez votre question ici..."
                      className="min-h-[80px]"
                    />
                    <Button size="sm" className="w-full">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Demander de l'aide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Country Info */}
              {selectedCountry && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="text-2xl mr-2">{selectedCountry.flag}</span>
                      {selectedCountry.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Délai de traitement
                        </span>
                        <span className="font-medium">{selectedCountry.processingTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          Coût approximatif
                        </span>
                        <span className="font-medium">{selectedCountry.averageCost}€</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center">
                          <Globe className="h-3 w-3 mr-1" />
                          Saison populaire
                        </span>
                        <span className="font-medium">{selectedCountry.popularSeason}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Progress Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Résumé de progression</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Étapes complétées</span>
                      <span className="font-medium">{completedSteps.length}/{steps.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">{Math.round(getProgressPercentage())}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut</span>
                      <Badge variant="outline">{getStatusLabel(userStatus)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durée estimée</span>
                      <span className="font-medium">{totalDuration}</span>
                    </div>
                  </div>

                  {/* ✅ Bouton Réinitialiser ici */}
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={resetProgress}
                    className="w-full"
                  >
                    Réinitialiser la progression
                  </Button>
                </CardContent>
              </Card>

              {/* Next Steps Preview */}
              {currentStep < steps.length && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prochaines étapes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {steps.slice(currentStep, currentStep + 2).map((step) => {
                        const StepIcon = getStepIcon(step.icon);
                        return (
                          <div key={step.id} className="flex items-center space-x-3 p-2 bg-muted/50 rounded">
                            <StepIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{step.title}</p>
                              <p className="text-xs text-muted-foreground">{step.estimatedDuration}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function VisaStepsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-32 w-32 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VisaStepsContent />
    </Suspense>
  );
}