/********************************************************************
 *   This C program was generated by spl2c, the Shakespeare to C    *
 *          converter by Jon �slund and Karl Hasselstr�m.           *
 ********************************************************************/

/* libspl definitions and function prototypes */
#include <spl.h>

int main(void)
{
  /******************************************************************
   * A ROSE BY ANY OTHER NAME                                       *
   ******************************************************************/
  
  CHARACTER *romeo;                       /* a speaker */
  CHARACTER *juliet;                      /* his muse */
  
  int comp1, comp2;
  
  global_initialize();
  
  romeo = initialize_character("Romeo");
  juliet = initialize_character("Juliet");
  
  act_i:                                  /* Something */
  
  act_i_scene_i:                          /* A garden */
  
  enter_scene(6, romeo);
  enter_scene(6, juliet);
  
  activate_character(8, romeo);
  char_input(7, second_person);
  char_output(7, second_person);
  
  activate_character(9, romeo);
  int_input(8, second_person);
  int_output(8, second_person);
  
  activate_character(10, romeo);
  char_input(9, second_person);
  char_output(9, second_person);
  
  exit_scene_all(10);
  
  return 0;
}
