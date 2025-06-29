'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import countries from '@/data/countries.json';
import visaStepsData from '@/data/visaSteps.json';
import { toast } from 'sonner';

const steps = visaStepsData.steps;

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  status: 'uploaded' | 'pending' | 'approved';
}

const stepIcons = {
  1: Search,
  2: FileText,
  3: Edit,
  4: Send,
  5: Clock
};

function VisaStepsContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      nationality: '',
      passportNumber: '',
      dateOfBirth: '',
      placeOfBirth: ''
    },
    travelInfo: {
      destination: '',
      purposeOfTravel: '',
      plannedDepartureDate: '',
      plannedReturnDate: '',
      accommodationAddress: ''
    },
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    }
  });
  const { user, isAuthenticated, loading } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const countryCode = searchParams.get('country');
    if (countryCode) {
      const country = countries.find(c => c.code === countryCode);
      setSelectedCountry(country || countries[0]);
    } else {
      setSelectedCountry(countries[0]);
    }

    // Load saved progress
    const savedProgress = localStorage.getItem('visaProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCurrentStep(progress.currentStep || 1);
      setCompletedSteps(progress.completedSteps || []);
      setFormData(progress.formData || formData);
      setDocuments(progress.documents || []);
    }
  }, [searchParams]);

  // Vérification d'accès sans redirection automatique
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="h-32 w-32 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl"
        >
          <Shield className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connexion requise
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Vous devez être connecté pour accéder aux démarches de visa.
          </p>
          <Button asChild>
            <a href="/countries">Retour aux destinations</a>
          </Button>
        </motion.div>
      </div>
    );
  }

  const saveProgress = () => {
    const progress = {
      currentStep,
      completedSteps,
      formData,
      documents,
      countryCode: selectedCountry?.code
    };
    localStorage.setItem('visaProgress', JSON.stringify(progress));
  };

  const handleStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
    
    if (stepNumber < steps.length) {
      setCurrentStep(stepNumber + 1);
    }
    
    saveProgress();
    toast.success(`Étape ${stepNumber} terminée !`);
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

  const handleFormUpdate = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
    saveProgress();
  };

  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Enhanced Header */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-xl relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 glass-effect"
                >
                  <Link href="/countries" className="flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Link>
                </Button>
              </motion.div>
              
              {selectedCountry && (
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.span 
                    className="text-3xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {selectedCountry.flag}
                  </motion.span>
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      Demande de visa - {selectedCountry.name}
                    </h1>
                    <p className="text-sm text-blue-100">
                      Étape {currentStep} sur {steps.length}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <motion.div 
              className="text-right"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="text-3xl font-bold text-white"
                animate={{ 
                  textShadow: [
                    '0 0 10px rgba(255, 255, 255, 0.5)',
                    '0 0 20px rgba(255, 255, 255, 0.8)',
                    '0 0 10px rgba(255, 255, 255, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {Math.round(getProgressPercentage())}%
              </motion.div>
              <div className="text-sm text-blue-100">Progression</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Progress Bar */}
      <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <Progress value={getProgressPercentage()} className="h-4 glass-effect" />
            </motion.div>
            
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = stepIcons[step.id as keyof typeof stepIcons];
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                
                return (
                  <motion.div 
                    key={step.id} 
                    className="flex flex-col items-center space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 relative ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isCurrent 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
                      }`}
                      whileHover={{ 
                        scale: 1.1, 
                        rotateY: 15,
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                      }}
                      animate={{
                        scale: isCurrent ? [1, 1.05, 1] : 1,
                      }}
                      transition={{ 
                        scale: { duration: 2, repeat: Infinity },
                        hover: { duration: 0.3 }
                      }}
                    >
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <CheckCircle className="h-7 w-7" />
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.8 }}
                        >
                          <StepIcon className="h-7 w-7" />
                        </motion.div>
                      )}
                      
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 border-2 border-blue-400 rounded-full"
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                    
                    <div className="text-center">
                      <p className={`text-sm font-medium ${
                        isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <motion.p 
                        className="text-xs text-muted-foreground"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      >
                        {Math.round(step.progress)}%
                      </motion.p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {currentStepData && (
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50, rotateY: 20 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: -50, rotateY: -20 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="preserve-3d"
                  >
                    <Card className="mb-6 glass-effect border-0 shadow-xl">
                      <CardHeader>
                        <motion.div
                          className="w-full h-48 bg-cover bg-center rounded-lg shadow-lg"
                          style={{ backgroundImage: `url(${currentStepData.image})` }}
                          whileHover={{ scale: 1.02, rotateX: 5 }}
                          transition={{ duration: 0.3 }}
                        />
                      </CardHeader>
                      <CardContent className="bg-background/80 backdrop-blur-sm">
                        <motion.h2 
                          className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                          whileHover={{ scale: 1.02 }}
                        >
                          {currentStepData.title}
                        </motion.h2>
                        <p className="text-muted-foreground mb-6">{currentStepData.description}</p>

                        {/* Step-specific content */}
                        {currentStep === 1 && (
                          <motion.div 
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <Alert className="glass-effect border-blue-200 dark:border-blue-800">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Assurez-vous de bien comprendre toutes les exigences avant de commencer votre demande.
                              </AlertDescription>
                            </Alert>
                            
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center">
                                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                                Liste de vérification
                              </h3>
                              {currentStepData.tasks.map((task, index) => (
                                <motion.div 
                                  key={index} 
                                  className="flex items-start space-x-3 p-3 glass-effect rounded-lg"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ x: 5, scale: 1.02 }}
                                >
                                  <Circle className="h-5 w-5 text-blue-600 mt-0.5" />
                                  <span className="text-muted-foreground">{task}</span>
                                </motion.div>
                              ))}
                            </div>
                            
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                onClick={() => handleStepComplete(1)}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                              >
                                <Sparkles className="h-4 w-4 mr-2" />
                                J'ai lu et compris les exigences
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}

                        {currentStep === 2 && (
                          <motion.div 
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-green-600" />
                                Documents requis
                              </h3>
                              {currentStepData.tasks.map((task, index) => (
                                <motion.div 
                                  key={index} 
                                  className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg glass-effect"
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ scale: 1.02 }}
                                >
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                  <span className="text-muted-foreground">{task}</span>
                                </motion.div>
                              ))}
                            </div>

                            <motion.div 
                              className="border-2 border-dashed border-border rounded-lg p-8 text-center glass-effect"
                              whileHover={{ scale: 1.02, borderColor: 'rgb(59 130 246)' }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              </motion.div>
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
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                  <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Sélectionner les fichiers
                                  </label>
                                </Button>
                              </motion.div>
                            </motion.div>

                            {documents.length > 0 && (
                              <motion.div 
                                className="space-y-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                              >
                                <h4 className="font-semibold flex items-center">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Documents téléchargés
                                </h4>
                                {documents.map((doc, index) => (
                                  <motion.div 
                                    key={doc.id} 
                                    className="flex items-center justify-between p-3 bg-background rounded-lg border glass-effect"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <FileText className="h-5 w-5 text-blue-600" />
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
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeDocument(doc.id)}
                                        >
                                          Supprimer
                                        </Button>
                                      </motion.div>
                                    </div>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                onClick={() => handleStepComplete(2)}
                                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg"
                                disabled={documents.length === 0}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Documents rassemblés
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}

                        {currentStep === 3 && (
                          <motion.div 
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <Alert className="glass-effect border-yellow-200 dark:border-yellow-800">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Remplissez tous les champs avec attention. Les informations doivent correspondre exactement à vos documents.
                              </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <motion.div 
                                className="space-y-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                              >
                                <h3 className="text-lg font-semibold flex items-center">
                                  <Edit className="h-5 w-5 mr-2 text-purple-600" />
                                  Informations personnelles
                                </h3>
                                
                                {[
                                  { id: 'firstName', label: 'Prénom', placeholder: 'Votre prénom' },
                                  { id: 'lastName', label: 'Nom de famille', placeholder: 'Votre nom de famille' },
                                  { id: 'nationality', label: 'Nationalité', placeholder: 'Votre nationalité' },
                                  { id: 'passportNumber', label: 'Numéro de passeport', placeholder: 'Numéro de passeport' }
                                ].map((field, index) => (
                                  <motion.div 
                                    key={field.id}
                                    className="space-y-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <Label htmlFor={field.id}>{field.label}</Label>
                                    <Input
                                      id={field.id}
                                      value={formData.personalInfo[field.id as keyof typeof formData.personalInfo]}
                                      onChange={(e) => handleFormUpdate('personalInfo', field.id, e.target.value)}
                                      placeholder={field.placeholder}
                                      className="glass-effect border-border/50"
                                    />
                                  </motion.div>
                                ))}
                              </motion.div>

                              <motion.div 
                                className="space-y-4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                              >
                                <h3 className="text-lg font-semibold flex items-center">
                                  <Globe className="h-5 w-5 mr-2 text-blue-600" />
                                  Informations de voyage
                                </h3>
                                
                                {[
                                  { id: 'destination', label: 'Destination', value: selectedCountry?.name || '', disabled: true },
                                  { id: 'purposeOfTravel', label: 'Motif du voyage', placeholder: 'Tourisme, affaires, famille...' },
                                  { id: 'plannedDepartureDate', label: 'Date de départ prévue', type: 'date' },
                                  { id: 'plannedReturnDate', label: 'Date de retour prévue', type: 'date' }
                                ].map((field, index) => (
                                  <motion.div 
                                    key={field.id}
                                    className="space-y-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <Label htmlFor={field.id}>{field.label}</Label>
                                    <Input
                                      id={field.id}
                                      type={field.type || 'text'}
                                      value={field.value || formData.travelInfo[field.id as keyof typeof formData.travelInfo]}
                                      onChange={(e) => handleFormUpdate('travelInfo', field.id, e.target.value)}
                                      placeholder={field.placeholder}
                                      disabled={field.disabled}
                                      className={`glass-effect border-border/50 ${field.disabled ? 'bg-muted' : ''}`}
                                    />
                                  </motion.div>
                                ))}
                              </motion.div>
                            </div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                onClick={() => handleStepComplete(3)}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                                disabled={!formData.personalInfo.firstName || !formData.personalInfo.lastName}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Formulaire complété
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}

                        {currentStep === 4 && (
                          <motion.div 
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <motion.div 
                              className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg glass-effect"
                              whileHover={{ scale: 1.02 }}
                            >
                              <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-900 dark:text-blue-100">
                                <Send className="h-5 w-5 mr-2" />
                                Prêt pour la soumission
                              </h3>
                              <p className="text-blue-800 dark:text-blue-200">
                                Votre dossier est maintenant complet et prêt à être soumis aux autorités compétentes.
                              </p>
                            </motion.div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center">
                                <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                                Instructions de soumission
                              </h3>
                              {currentStepData.tasks.map((task, index) => (
                                <motion.div 
                                  key={index} 
                                  className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg glass-effect"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ x: 5, scale: 1.02 }}
                                >
                                  <motion.div 
                                    className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold mt-0.5"
                                    whileHover={{ scale: 1.2, rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    {index + 1}
                                  </motion.div>
                                  <span className="text-muted-foreground">{task}</span>
                                </motion.div>
                              ))}
                            </div>

                            <motion.div 
                              className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg glass-effect"
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="flex items-start space-x-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Important</h4>
                                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                    Assurez-vous d'avoir tous vos documents originaux avec vous lors du rendez-vous.
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                onClick={() => handleStepComplete(4)}
                                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Dossier soumis
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}

                        {currentStep === 5 && (
                          <motion.div 
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="text-center">
                              <motion.div 
                                className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
                                animate={{ 
                                  scale: [1, 1.1, 1],
                                  rotate: [0, 360]
                                }}
                                transition={{ 
                                  scale: { duration: 2, repeat: Infinity },
                                  rotate: { duration: 3, repeat: Infinity }
                                }}
                              >
                                <Sparkles className="h-10 w-10 text-green-600" />
                              </motion.div>
                              <h3 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                Félicitations !
                              </h3>
                              <p className="text-muted-foreground">
                                Votre demande de visa a été complétée avec succès.
                              </p>
                            </div>

                            <motion.div 
                              className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg glass-effect"
                              whileHover={{ scale: 1.02 }}
                            >
                              <h3 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-200 flex items-center">
                                <Star className="h-5 w-5 mr-2" />
                                Prochaines étapes
                              </h3>
                              <div className="space-y-3">
                                {currentStepData.tasks.map((task, index) => (
                                  <motion.div 
                                    key={index} 
                                    className="flex items-start space-x-3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ x: 5 }}
                                  >
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    <span className="text-green-700 dark:text-green-300">{task}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                asChild
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                              >
                                <Link href={`/countries/${selectedCountry?.code.toLowerCase()}`}>
                                  <Globe className="h-4 w-4 mr-2" />
                                  Découvrir les hébergements
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* AI Assistant */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, rotateY: 5 }}
              >
                <Card className="glass-effect border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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
                        className="min-h-[80px] glass-effect border-border/50"
                      />
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Demander de l'aide
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02, rotateY: 5 }}
              >
                <Card className="glass-effect border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { icon: Download, text: 'Télécharger le récapitulatif' },
                      { icon: FileText, text: 'Consulter la checklist' },
                      { icon: MessageCircle, text: 'Contacter le support' }
                    ].map((action, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button variant="outline" size="sm" className="w-full justify-start glass-effect border-border/50">
                          <action.icon className="h-4 w-4 mr-2" />
                          {action.text}
                        </Button>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Country Info */}
              {selectedCountry && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02, rotateY: 5 }}
                >
                  <Card className="glass-effect border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <motion.span 
                          className="text-2xl mr-2"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          {selectedCountry.flag}
                        </motion.span>
                        {selectedCountry.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        {[
                          { label: 'Délai de traitement', value: selectedCountry.processingTime, icon: Clock },
                          { label: 'Coût approximatif', value: `${selectedCountry.averageCost}€`, icon: Star },
                          { label: 'Saison populaire', value: selectedCountry.popularSeason, icon: Globe }
                        ].map((info, index) => (
                          <motion.div 
                            key={index}
                            className="flex justify-between items-center"
                            whileHover={{ x: 5 }}
                          >
                            <span className="text-muted-foreground flex items-center">
                              <info.icon className="h-3 w-3 mr-1" />
                              {info.label}
                            </span>
                            <span className="font-medium">{info.value}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="h-32 w-32 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    }>
      <VisaStepsContent />
    </Suspense>
  );
}