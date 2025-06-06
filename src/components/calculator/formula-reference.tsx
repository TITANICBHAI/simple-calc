"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label} from '@/components/ui/label';
import { Trash2, Pencil, Download, Upload } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FormulaItem {
  name: string;
  formula: string;
  description?: string;
}

interface FormulaCategory {
  categoryName: string;
  formulas: FormulaItem[];
}

// Function to load formulas from local storage
const loadUserFormulas = (): FormulaCategory[] => {
  if (typeof window === 'undefined') return []; // Ensure localStorage is available
  const storedFormulas = localStorage.getItem('calcul8UserFormulas');
  try {
    if (storedFormulas) {
      const parsed = JSON.parse(storedFormulas);
      // Basic validation: check if it's an array and the first item has categoryName and formulas array
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].categoryName === 'User-Added Formulas' && Array.isArray(parsed[0].formulas)) {
        // Further validate each formula item in the user-added category
        const userCategory = parsed.find(cat => cat.categoryName === 'User-Added Formulas');
        if (userCategory && Array.isArray(userCategory.formulas)) {
            userCategory.formulas = userCategory.formulas.filter(
                (item: any) => typeof item.name === 'string' && item.name.trim() !== '' &&
                                typeof item.formula === 'string' && item.formula.trim() !== '' &&
                                (typeof item.description === 'string' || item.description === undefined)
            );
        }
        return parsed as FormulaCategory[];
      }
    }
  } catch (e) {
    console.error("Failed to parse user formulas from localStorage", e);
    localStorage.removeItem('calcul8UserFormulas'); // Clear corrupted data
  }
  return [{ categoryName: 'User-Added Formulas', formulas: [] }]; // Return default if not found or invalid
}

const predefinedFormulaData: FormulaCategory[] = [
  {
    categoryName: 'Algebra',
    formulas: [
      {
        name: 'Quadratic Formula',
        formula: 'x = [-b ± √(b²-4ac)] / 2a',
        description: 'Solves for x in an equation of the form ax² + bx + c = 0.',
      },
      {
        name: 'Slope of a Line',
        formula: 'm = (y₂ - y₁) / (x₂ - x₁)',
        description: 'Calculates the steepness of a line given two points (x₁, y₁) and (x₂, y₂).',
      },
      {
        name: 'Point-Slope Form',
        formula: 'y - y₁ = m(x - x₁)',
        description: 'Equation of a line given a point (x₁, y₁) and slope m.',
      },
      {
        name: 'Slope-Intercept Form',
        formula: 'y = mx + b',
        description: 'Equation of a line where m is the slope and b is the y-intercept.',
      },
      {
        name: 'Distance Formula',
        formula: 'd = √((x₂ - x₁)² + (y₂ - y₁)²)',
        description: 'Calculates the distance between two points in a Cartesian plane.',
      },
    ],
  },
  {
    categoryName: 'Geometry',
    formulas: [
      {
        name: 'Area of a Circle',
        formula: 'A = πr²',
        description: 'Where r is the radius of the circle.',
      },
      {
        name: 'Circumference of a Circle',
        formula: 'C = 2πr',
        description: 'Where r is the radius of the circle.',
      },
      {
        name: 'Area of a Rectangle',
        formula: 'A = lw',
        description: 'Where l is the length and w is the width.',
      },
      {
        name: 'Perimeter of a Rectangle',
        formula: 'P = 2(l + w)',
        description: 'Where l is the length and w is the width.',
      },
      {
        name: 'Pythagorean Theorem',
        formula: 'a² + b² = c²',
        description: 'Relates the sides of a right triangle, where c is the hypotenuse.',
      },
      {
        name: 'Area of a Triangle',
        formula: 'A = ½bh',
        description: 'Where b is the base and h is the height.',
      },
      {
        name: 'Volume of a Cube',
        formula: 'V = s³',
        description: 'Where s is the side length.',
      },
      {
        name: 'Volume of a Rectangular Prism',
        formula: 'V = lwh',
        description: 'Where l is length, w is width, and h is height.',
      },
      {
        name: 'Volume of a Cylinder',
        formula: 'V = πr²h',
        description: 'Where r is the radius and h is the height.',
      },
      {
        name: 'Volume of a Sphere',
        formula: 'V = (4/3)πr³',
        description: 'Where r is the radius.',
      },
    ],
  },
  {
    categoryName: 'Basic Physics',
    formulas: [
      {
            name: "Ohm's Law",
            formula: "V = IR",
            description: "Relates voltage (V), current (I), and resistance (R) in an electrical circuit."
        },
        {
            name: "Speed",
            formula: "s = d/t",
            description: "Calculates speed (s) given distance (d) and time (t)."
        },
        {
            name: "Velocity (Average)",
            formula: "v = Δx/Δt",
            description: "Calculates average velocity (v) given change in position (Δx) and change in time (Δt)."
        },
        {
            name: "Acceleration (Average)",
            formula: "a = Δv/Δt",
            description: "Calculates average acceleration (a) given change in velocity (Δv) and change in time (Δt)."
        },
        {
            name: "Density",
            formula: "ρ = m/V",
            description: "Calculates density (ρ) given mass (m) and volume (V)."
        },
        {
            name: "Work",
            formula: "W = Fd cos(θ)",
            description: "Calculates work done (W) by a constant force (F) over a distance (d) at an angle (θ)."
        },
        {
            name: "Kinetic Energy",
            formula: "KE = ½mv²",
            description: "Calculates kinetic energy (KE) given mass (m) and velocity (v)."
        },
    ]
  },
   {
    categoryName: 'Trigonometry (Right Triangle)',
    formulas: [
      {
            name: "Sine (sin θ)",
            formula: "sin(θ) = Opposite / Hypotenuse",
        },
        {
            name: "Cosine (cos θ)",
            formula: "cos(θ) = Adjacent / Hypotenuse",
        },
        {
            name: "Tangent (tan θ)",
            formula: "tan(θ) = Opposite / Adjacent",
        },
        {
            name: "Cosecant (csc θ)",
            formula: "csc(θ) = Hypotenuse / Opposite",
        },
        {
            name: "Secant (sec θ)",
            formula: "sec(θ) = Hypotenuse / Adjacent",
        },
        {
            name: "Cotangent (cot θ)",
            formula: "cot(θ) = Adjacent / Opposite",
        }
    ]
  },
  {
    categoryName: 'Exponents & Logarithms',
    formulas: [
      { name: 'Product Rule', formula: 'xᵃ ⋅ xᵇ = xᵃ⁺ᵇ' },
        { name: 'Quotient Rule', formula: 'xᵃ / xᵇ = xᵃ⁻ᵇ' },
        { name: 'Power Rule', formula: '(xᵃ)ᵇ = xᵃᵇ' },
        { name: 'Logarithm Definition', formula: 'logₐ(b) = c  ⇔  aᶜ = b' },
        { name: 'Change of Base (Log)', formula: 'logₐ(b) = logₓ(b) / logₓ(a)' },
    ]
  }
];

const FormulaReference: React.FC = () => {
  const [userFormulaCategories, setUserFormulaCategories] = useState<FormulaCategory[]>([]);
  const [newFormulaName, setNewFormulaName] = useState('');
  const [newFormulaFormula, setNewFormulaFormula] = useState('');
  const [newFormulaDescription, setNewFormulaDescription] = useState('');
  const [editingFormula, setEditingFormula] = useState<{original: FormulaItem, current: FormulaItem} | null>(null);
  const [formulaInputError, setFormulaInputError] = useState('');

  useEffect(() => {
    setUserFormulaCategories(loadUserFormulas());
  }, []);

  const saveUserFormulas = useCallback((formulas: FormulaCategory[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calcul8UserFormulas', JSON.stringify(formulas));
    }
  }, []);
  
  const isValidFormulaInput = (name: string, formulaStr: string): boolean => {
    if (!name.trim()) {
      setFormulaInputError('Formula name cannot be empty.');
      return false;
    }
    if (!formulaStr.trim()) {
      setFormulaInputError('Formula string cannot be empty.');
      return false;
    }
    // Basic check for invalid ending characters, can be expanded
    if (/[+\-*/^%.]$/.test(formulaStr.trim()) || /^\s*[+\-*/^%.]/.test(formulaStr.trim())) {
      setFormulaInputError('Formula string cannot start or end with an operator or decimal point.');
      return false;
    }
    setFormulaInputError('');
    return true;
  };

  const handleAddFormula = useCallback(() => {
    if (!isValidFormulaInput(newFormulaName, newFormulaFormula)) return;

    const newUserFormula: FormulaItem = { 
      name: newFormulaName.trim(), 
      formula: newFormulaFormula.trim(),
      description: newFormulaDescription.trim() || undefined
    };
    
    setUserFormulaCategories(prevUserFormulas => {
      const updatedCategories = prevUserFormulas.length > 0 ? 
                                prevUserFormulas.map(cat => ({...cat, formulas: [...cat.formulas]})) : 
                                [{ categoryName: 'User-Added Formulas', formulas: [] }];

      let userCategory = updatedCategories.find(cat => cat.categoryName === 'User-Added Formulas');
      if (!userCategory) {
        userCategory = { categoryName: 'User-Added Formulas', formulas: [] };
        updatedCategories.push(userCategory);
      }
      
      if (userCategory.formulas.some(f => f.name.toLowerCase() === newUserFormula.name.toLowerCase())) {
        toast({ title: "Duplicate Name", description: "A formula with this name already exists in your list.", variant: "destructive"});
        return prevUserFormulas; 
      }

      userCategory.formulas.push(newUserFormula);
      saveUserFormulas(updatedCategories);
      toast({ title: "Formula Added", description: `"${newUserFormula.name}" added successfully.`});
      return updatedCategories;
    });

    setNewFormulaName('');
    setNewFormulaFormula('');
    setNewFormulaDescription('');
    setFormulaInputError('');
  }, [newFormulaName, newFormulaFormula, newFormulaDescription, saveUserFormulas]);

  const handleDeleteFormula = useCallback((formulaToDelete: FormulaItem) => {
    setUserFormulaCategories(prevUserFormulas => {
      const updatedCategories = prevUserFormulas.map(category => {
        if (category.categoryName === 'User-Added Formulas') {
          return {
            ...category,
            formulas: category.formulas.filter(
              (formula) => !(formula.name === formulaToDelete.name && formula.formula === formulaToDelete.formula)
            ),
          };
        }
        return category;
      }).filter(category => !(category.categoryName === 'User-Added Formulas' && category.formulas.length === 0)); 
      
      saveUserFormulas(updatedCategories);
      toast({ title: "Formula Deleted", description: `"${formulaToDelete.name}" removed.`});
      return updatedCategories;
    });
  }, [saveUserFormulas]);

  const handleEditFormula = (formula: FormulaItem) => {
    setEditingFormula({original: formula, current: {...formula}});
    setFormulaInputError('');
  };

  const handleSaveEdit = useCallback(() => {
    if (!editingFormula) return;
    if (!isValidFormulaInput(editingFormula.current.name, editingFormula.current.formula)) return;

    setUserFormulaCategories(prevUserFormulas => {
        const updatedCategories = prevUserFormulas.map(category => {
            if (category.categoryName === 'User-Added Formulas') {
                const isNameChanged = editingFormula.original.name.toLowerCase() !== editingFormula.current.name.trim().toLowerCase();
                const newName = editingFormula.current.name.trim();
                
                if (isNameChanged && category.formulas.some(f => 
                    f.name.toLowerCase() === newName.toLowerCase() && 
                    (f.formula !== editingFormula.original.formula || f.name !== editingFormula.original.name) // Ensure it's not the same formula being "renamed" to its current name
                )) {
                     toast({ title: "Duplicate Name", description: `Another formula with the name "${newName}" already exists.`, variant: "destructive"});
                     return category; 
                }

                return {
                    ...category,
                    formulas: category.formulas.map(
                        (f) => (f.name === editingFormula.original.name && f.formula === editingFormula.original.formula)
                            ? { ...editingFormula.current, name: newName, formula: editingFormula.current.formula.trim(), description: editingFormula.current.description?.trim() || undefined }
                            : f
                    ),
                };
            }
            return category;
        });
        saveUserFormulas(updatedCategories);
        toast({ title: "Formula Updated", description: `"${editingFormula.current.name}" updated.`});
        setEditingFormula(null);
        setFormulaInputError('');
        return updatedCategories;
    });
  }, [editingFormula, saveUserFormulas]);
  
  const handleExportFormulas = useCallback(() => {
    const userCategory = userFormulaCategories.find(cat => cat.categoryName === 'User-Added Formulas');
    if (!userCategory || userCategory.formulas.length === 0) {
      toast({ title: "No Formulas", description: "No user-added formulas to export.", variant: "default"});
      return;
    }
    const dataStr = JSON.stringify(userCategory.formulas, null, 2); 
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'calcul8_my_formulas.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    toast({ title: "Export Successful", description: "Your formulas have been downloaded."});
  }, [userFormulaCategories]);

  const handleImportFormulas = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedItemsAny: any[] = JSON.parse(e.target?.result as string);
        
        if (!Array.isArray(importedItemsAny)) {
          toast({ title: "Import Failed", description: "Invalid file format. Expected an array of formulas.", variant: "destructive"});
          return;
        }

        const validImportedItems: FormulaItem[] = [];
        let invalidSkipped = 0;

        for (const item of importedItemsAny) {
            if (item && typeof item.name === 'string' && item.name.trim() !== '' &&
                typeof item.formula === 'string' && item.formula.trim() !== '' &&
                (item.description === undefined || typeof item.description === 'string')) {
                validImportedItems.push({
                    name: item.name.trim(),
                    formula: item.formula.trim(),
                    description: item.description?.trim() || undefined
                });
            } else {
                invalidSkipped++;
            }
        }
        
        setUserFormulaCategories(prevUserFormulas => {
            const updatedCategories = prevUserFormulas.length > 0 ? 
                                      prevUserFormulas.map(cat => ({...cat, formulas: [...cat.formulas]})) :
                                      [{ categoryName: 'User-Added Formulas', formulas: [] }];
                                      
            let userCategory = updatedCategories.find(cat => cat.categoryName === 'User-Added Formulas');
             if (!userCategory) {
                userCategory = { categoryName: 'User-Added Formulas', formulas: [] };
                updatedCategories.push(userCategory);
            }

            const existingFormulaNames = new Set(userCategory.formulas.map(f => f.name.toLowerCase()));
            let importedCount = 0;
            let duplicateSkipped = 0;

            validImportedItems.forEach(importedFormula => {
              if (!existingFormulaNames.has(importedFormula.name.toLowerCase())) {
                  userCategory!.formulas.push(importedFormula);
                  existingFormulaNames.add(importedFormula.name.toLowerCase());
                  importedCount++;
              } else {
                  console.warn(`Skipping duplicate formula name during import: ${importedFormula.name}`);
                  duplicateSkipped++;
              }
            });
            
            if (importedCount > 0) {
                 saveUserFormulas(updatedCategories);
            }
            toast({ 
                title: "Import Complete", 
                description: `${importedCount} formula(s) imported. ${duplicateSkipped} duplicates skipped. ${invalidSkipped > 0 ? `${invalidSkipped} invalid entries skipped.` : ''}`
            });
            return updatedCategories;
        });

      } catch (error) {
        toast({ title: "Import Error", description: "Could not parse the file. Please ensure it's a valid JSON.", variant: "destructive"});
        console.error("Import formulas error:", error);
      } finally {
         if (event.target) {
            event.target.value = ''; 
        }
      }
    };
    reader.readAsText(file);
  }, [saveUserFormulas]);

  const allFormulaDataToDisplay = React.useMemo(() => {
    const userCat = userFormulaCategories.find(cat => cat.categoryName === 'User-Added Formulas');
    if (userCat && userCat.formulas.length > 0) {
      return [...predefinedFormulaData, userCat];
    }
    return predefinedFormulaData;
  }, [userFormulaCategories]);


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <BookOpen className="mr-2 h-6 w-6 text-accent" />
          Formula Reference
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          A quick reference for common mathematical and scientific formulas. You can also add, edit, and manage your own.
        </p>
        
        {editingFormula ? (
          <div className="space-y-4 border p-4 rounded-md bg-secondary/50 shadow-sm">
            <h3 className="text-lg font-semibold">Edit Formula: <span className="text-accent">{editingFormula.original.name}</span></h3>
             {formulaInputError && (<p className="text-destructive text-sm mb-2">{formulaInputError}</p>)}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-formula-name">Formula Name</Label>
                <Input id="edit-formula-name" value={editingFormula.current.name} onChange={(e) => { setEditingFormula(ef => ef ? {...ef, current: {...ef.current, name: e.target.value}} : null); if(formulaInputError) setFormulaInputError(''); }} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-formula-formula">Formula</Label>
                <Input id="edit-formula-formula" value={editingFormula.current.formula} onChange={(e) => { setEditingFormula(ef => ef ? {...ef, current: {...ef.current, formula: e.target.value}} : null); if(formulaInputError) setFormulaInputError(''); }} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-formula-description">Description (Optional)</Label>
                <Input id="edit-formula-description" value={editingFormula.current.description || ''} onChange={(e) => { setEditingFormula(ef => ef ? {...ef, current: {...ef.current, description: e.target.value}} : null); }} />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
                <Button onClick={handleSaveEdit}>Save Changes</Button>
                <Button variant="outline" onClick={() => { setEditingFormula(null); setFormulaInputError(''); }}>Cancel Edit</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 border p-4 rounded-md bg-muted/30 shadow-sm">
            <h3 className="text-lg font-semibold">Add Your Own Formula</h3>
             {(formulaInputError) && (<p className="text-destructive text-sm mb-2">{formulaInputError}</p>)}
            <div className="grid grid-cols-1 gap-4 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="formula-name">Formula Name</Label>
                <Input id="formula-name" value={newFormulaName} onChange={(e) => { setNewFormulaName(e.target.value); if(formulaInputError) setFormulaInputError(''); }} placeholder="e.g., Area of a Square" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="formula-formula">Formula</Label>
                <Input id="formula-formula" value={newFormulaFormula} onChange={(e) => { setNewFormulaFormula(e.target.value); if(formulaInputError) setFormulaInputError(''); }} placeholder="e.g., A = s²" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="formula-description">Description (Optional)</Label>
                <Input id="formula-description" value={newFormulaDescription} onChange={(e) => setNewFormulaDescription(e.target.value)} placeholder="e.g., Where s is the side length" />
              </div>
            </div>
            <Button onClick={handleAddFormula} className="mt-3">Add Formula</Button>
          </div>
        )}

        <Accordion type="multiple" className="w-full" defaultValue={['Algebra', 'User-Added Formulas']}>
          {allFormulaDataToDisplay.map((category) => (
            category.formulas.length > 0 && 
            <AccordionItem value={category.categoryName} key={category.categoryName}>
              <AccordionTrigger className="text-lg hover:no-underline hover:text-accent transition-colors">
                {category.categoryName} ({category.formulas.length})
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 pt-2">
                  {category.formulas.map((item) => (
                    <li key={`${category.categoryName}-${item.name}-${item.formula}`} className="border-l-2 border-primary/50 pl-4 py-2 bg-card rounded-r-md shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-base text-foreground">{item.name}</p>
                            <p className="font-mono text-accent text-md my-1 bg-muted/40 p-2 rounded break-all inline-block shadow-inner">{item.formula}</p>
                            {item.description && (
                                <p className="text-xs text-muted-foreground italic mt-1">{item.description}</p>
                            )}
                        </div>
                        {category.categoryName === 'User-Added Formulas' && (
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 ml-2 flex-shrink-0">
                            <TooltipProvider>
                              <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditFormula(item)}>
                                    <Pencil className="h-4 w-4 text-blue-500 hover:text-blue-600" />
                                    <span className="sr-only">Edit formula {item.name}</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Edit Formula</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteFormula(item)}>
                                        <Trash2 className="h-4 w-4 text-destructive hover:text-red-700" />
                                        <span className="sr-only">Delete formula {item.name}</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Delete Formula</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
         <p className="text-xs text-muted-foreground text-center pt-4">
          This reference section will continue to grow! Found a bug or have a suggestion? Let us know.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-6 border-t">
        <Button onClick={handleExportFormulas} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export My Formulas
        </Button>
        <input
          id="import-formulas-input"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportFormulas}
        />
        <Label htmlFor="import-formulas-input" className="cursor-pointer">
          <Button asChild variant="outline" size="sm">
            <div>
              <Upload className="mr-2 h-4 w-4" />
              Import My Formulas
            </div>
          </Button>
        </Label>
      </CardFooter>
      <CardFooter className="flex justify-center">
        <ins className="adsbygoogle"
             style={{ display: 'block', textAlign: 'center' }}
             data-ad-client="ca-pub-1074051846339488"
             data-ad-slot="8922282796"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
      </CardFooter>
    </Card>
  );
};

export default FormulaReference;

