/********************************************************************
 *   This C program was generated by spl2c, the Shakespeare to C    *
 *          converter by Jon �slund and Karl Hasselstr�m.           *
 ********************************************************************/

/* libspl definitions and function prototypes */
#include <spl.h>

int main(void)
{
  /******************************************************************
   * A TALE OF TWO CITES ( SIC )                                    *
   ******************************************************************/
  
  CHARACTER *julius_caesar;               /* the first citizen of the Roman Republic */
  CHARACTER *brutus;                      /* a traitor - - member of the Fifth Column */
  CHARACTER *cicero;                      /* the greatest Roman orator */
  CHARACTER *cleopatra;                   /* a proud queen , whom the Romans want to make one of their own */
  CHARACTER *romeo;                       /* a man who ' s sometimes there */
  CHARACTER *juliet;                      /* a maiden who can follow Romeo or stand on her own */
  
  int comp1, comp2;
  
  global_initialize();
  
  julius_caesar = initialize_character("Julius Caesar");
  brutus = initialize_character("Brutus");
  cicero = initialize_character("Cicero");
  cleopatra = initialize_character("Cleopatra");
  romeo = initialize_character("Romeo");
  juliet = initialize_character("Juliet");
  
  act_i:                                  /* Imperium Romanum */
  
  act_i_scene_i:                          /* Cleopatra puts men in their place */
  
  enter_scene(14, cleopatra);
  enter_scene(14, julius_caesar);
  
  activate_character(17, julius_caesar);
  assign(16, second_person, int_add(16, 2*2*2*2*2*1, 2*2*2*1));
  char_output(16, second_person);
  char_input(16, second_person);
  char_input(16, second_person);
  char_input(16, second_person);
  char_input(16, second_person);
  
  activate_character(19, cleopatra);
  assign(17, second_person, int_add(17, 2*2*2*2*2*2*1, int_add(17, 2*2*2*1, 1)));
  
  exit_scene(19, julius_caesar);
  
  enter_scene(20, brutus);
  
  activate_character(24, cleopatra);
  assign(22, second_person, int_add(22, int_add(22, 2*2*2*2*2*2*1, 2*2*2*2*1), int_add(22, 2*2*1, 2*1)));
  
  exit_scene(24, brutus);
  
  enter_scene(25, cicero);
  
  activate_character(30, cleopatra);
  assign(27, second_person, int_add(27, int_add(27, 2*2*2*2*2*2*1, 2*2*2*2*1), 2*2*2*1));
  
  act_i_scene_ii:                         /* How do you solve a problem like Cleopatra */
  
  exit_scene_all(32);
  
  enter_scene(33, cleopatra);
  enter_scene(33, julius_caesar);
  
  activate_character(37, julius_caesar);
  int_input(35, second_person);
  
  exit_scene(37, cleopatra);
  
  enter_scene(38, brutus);
  
  activate_character(41, julius_caesar);
  comp1 = cleopatra->value;
  comp2 = 2*2*2*1;
  truth_flag = (comp1 > comp2);
  
  activate_character(42, brutus);
  if (truth_flag) {
    goto act_i_scene_iv;
  }
  comp1 = cleopatra->value;
  comp2 = 2*2*1;
  truth_flag = !(comp1 < comp2);
  
  activate_character(43, julius_caesar);
  if (truth_flag) {
    goto act_i_scene_iii;
  }
  
  activate_character(44, brutus);
  char_output(43, second_person);
  
  activate_character(45, julius_caesar);
  comp1 = cleopatra->value;
  comp2 = 1;
  truth_flag = (comp1 > comp2);
  
  activate_character(46, brutus);
  if (truth_flag) {
    char_output(45, second_person);
  }
  
  activate_character(47, julius_caesar);
  comp1 = cleopatra->value;
  comp2 = 2*1;
  truth_flag = (comp1 > comp2);
  
  activate_character(48, brutus);
  if (truth_flag) {
    char_output(47, second_person);
  }
  
  activate_character(50, julius_caesar);
  goto act_i_scene_v;
  
  act_i_scene_iii:                        /* Brutus and his friends */
  
  activate_character(52, julius_caesar);
  comp1 = cleopatra->value;
  comp2 = 2*2*1;
  truth_flag = (comp1 == comp2);
  
  activate_character(53, brutus);
  if (truth_flag) {
    char_output(52, second_person);
  }
  
  activate_character(54, julius_caesar);
  char_output(53, second_person);
  
  activate_character(55, julius_caesar);
  comp1 = cleopatra->value;
  comp2 = int_add(54, 2*2*1, 1);
  truth_flag = (comp1 > comp2);
  
  activate_character(56, brutus);
  if (truth_flag) {
    char_output(55, second_person);
  }
  
  activate_character(57, julius_caesar);
  comp1 = cleopatra->value;
  comp2 = int_add(56, 2*2*1, 2*1);
  truth_flag = (comp1 > comp2);
  
  activate_character(58, brutus);
  if (truth_flag) {
    char_output(57, second_person);
  }
  
  activate_character(59, julius_caesar);
  comp1 = cleopatra->value;
  comp2 = 2*2*2*1;
  truth_flag = (comp1 == comp2);
  
  activate_character(60, brutus);
  if (truth_flag) {
    char_output(59, second_person);
  }
  
  activate_character(62, julius_caesar);
  goto act_i_scene_v;
  
  act_i_scene_iv:                         /* Cicero is asked to speak */
  
  exit_scene(63, brutus);
  
  enter_scene(64, cicero);
  
  activate_character(66, julius_caesar);
  comp1 = cleopatra->value;
  comp2 = int_add(65, 2*2*2*1, 1);
  truth_flag = (comp1 == comp2);
  
  activate_character(67, cicero);
  if (truth_flag) {
    char_output(66, second_person);
  }
  
  activate_character(69, julius_caesar);
  char_output(67, second_person);
  
  act_i_scene_v:                          /* A period piece - - Cleopatra ' s reprisal */
  
  exit_scene_all(70);
  
  enter_scene(71, cleopatra);
  enter_scene(71, julius_caesar);
  
  activate_character(74, julius_caesar);
  assign(73, second_person, int_add(73, 2*2*2*2*2*1, 2*2*2*2*1));
  assign(73, second_person, int_sub(73, value_of(73, second_person), 2*1));
  char_output(73, second_person);
  
  activate_character(75, julius_caesar);
  char_input(74, second_person);
  char_input(74, second_person);
  char_input(74, second_person);
  char_input(74, second_person);
  char_input(74, second_person);
  char_input(74, second_person);
  
  activate_character(76, cleopatra);
  comp1 = value_of(75, second_person);
  comp2 = int_add(75, 2*2*2*2*2*2*1, 2*2*2*2*2*1);
  truth_flag = (comp1 > comp2);
  
  activate_character(77, julius_caesar);
  if (truth_flag) {
    goto act_ii;
  }
  char_input(76, second_person);
  char_input(76, second_person);
  
  activate_character(78, cleopatra);
  assign(77, second_person, int_add(77, value_of(77, second_person), 2*2*2*2*2*1));
  
  exit_scene(78, julius_caesar);
  
  enter_scene(79, brutus);
  
  activate_character(81, cleopatra);
  assign(80, second_person, int_add(80, value_of(80, second_person), 2*2*2*2*2*1));
  
  exit_scene(81, brutus);
  
  enter_scene(82, cicero);
  
  activate_character(85, cleopatra);
  assign(83, second_person, int_sub(83, brutus->value, 2*(-1)));
  goto act_i_scene_ii;
  
  act_ii:                                 /* Lovers ' arithmetic */
  
  act_ii_scene_i:                         /* Reduction */
  
  exit_scene_all(89);
  
  enter_scene(90, romeo);
  enter_scene(90, juliet);
  
  activate_character(93, romeo);
  assign(92, second_person, (-1));
  int_input(92, second_person);
  
  activate_character(94, juliet);
  comp1 = value_of(93, first_person);
  comp2 = 0;
  truth_flag = (comp1 > comp2);
  if (truth_flag) {
    goto act_ii_scene_iii;
  }
  
  activate_character(95, romeo);
  char_input(94, second_person);
  char_input(94, second_person);
  
  activate_character(96, juliet);
  int_input(95, second_person);
  int_output(95, second_person);
  
  activate_character(97, romeo);
  assign(96, second_person, int_mul(96, int_sub(96, 2*2*2*2*1, 1), int_add(96, 2*1, 1)));
  char_output(96, second_person);
  char_input(96, second_person);
  
  activate_character(98, romeo);
  int_input(97, second_person);
  
  activate_character(99, romeo);
  comp1 = int_div(98, value_of(98, second_person), int_add(98, int_add(98, 2*2*2*2*2*2*1, 2*2*2*2*2*1), 2*2*1));
  comp2 = int_div(98, value_of(98, first_person), int_add(98, int_add(98, 2*2*2*2*2*2*1, 2*2*2*2*2*1), 2*2*1));
  truth_flag = (comp1 == comp2);
  
  activate_character(100, juliet);
  if (!truth_flag) {
    goto act_ii_scene_ii;
  }
  
  activate_character(101, romeo);
  assign(100, second_person, int_mod(100, value_of(100, second_person), int_add(100, int_add(100, 2*2*2*2*2*2*1, 2*2*2*2*2*1), 2*2*1)));
  
  activate_character(103, juliet);
  assign(101, second_person, int_mod(101, value_of(101, second_person), int_add(101, int_add(101, 2*2*2*2*2*2*1, 2*2*2*2*2*1), 2*2*1)));
  
  act_ii_scene_ii:                        /* Tense times */
  
  activate_character(105, juliet);
  comp1 = int_div(104, value_of(104, second_person), int_add(104, 2*2*2*1, 2*1));
  comp2 = int_div(104, value_of(104, first_person), int_add(104, 2*2*2*1, 2*1));
  truth_flag = (comp1 == comp2);
  
  activate_character(107, romeo);
  if (truth_flag) {
    assign(105, second_person, int_mod(105, value_of(105, second_person), int_add(105, 2*2*2*1, 2*1)));
  }
  
  act_ii_scene_iii:                       /* Parting is such sweet sorrow */
  
  activate_character(109, romeo);
  int_output(108, second_person);
  assign(108, second_person, int_add(108, 2*2*2*2*2*1, int_add(108, 2*2*2*1, 1)));
  char_output(108, second_person);
  
  return 0;
}
