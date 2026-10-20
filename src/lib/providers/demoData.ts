/**
 * demoData.ts — Rich, schema-valid demo event plans.
 *
 * Provides turnkey demonstration data for offline testing and 1-click demos:
 * 1. Wedding: "Vineyard Harmony — Napa Valley Wedding"
 * 2. Birthday: "Neon Nostalgia — Rooftop 30th Birthday Bash"
 * 3. Community: "Sunset Green Community Arts & Eco Festival"
 * 4. Gala: "Starlight Hope Annual Charity Gala"
 */

import type { PlanResult } from '../schema.js';
import type { EventTypeId } from '../domain.js';
import { rescaleBudgetCategories } from '../plannerEngine.js';

export const DEMO_WEDDING_PLAN: PlanResult = {
  event_name: 'Vineyard Harmony — Napa Valley Estate Wedding',
  event_type: 'wedding',
  guest_count: 120,
  total_budget: 32000,
  currency: '$',
  executive_summary:
    'An intimate yet luxurious vineyard wedding blending rustic natural elegance with bespoke wine-country hospitality. The plan prioritizes fluid transitions from the open-air panoramic ceremony to the barrel-room dinner and courtyard dancing.',
  theme_and_vibe: {
    theme_name: 'Rustic Vineyard Elegance',
    color_palette: [
      { name: 'Warm Champagne', hex: '#FDF8F0' },
      { name: 'Eucalyptus Sage', hex: '#8A9A5B' },
      { name: 'Aged Oak', hex: '#5C4033' },
      { name: 'Rose Gold', hex: '#B76E79' },
    ],
    aesthetic_notes:
      'Natural cedar wood tables, textured linen runners, soft warm Edison string lighting, and cascading native olive branches.',
    signature_touch:
      'Custom wine-blending ceremony during golden hour and a late-night wood-fired artisan pizza cart.',
  },
  budget_breakdown: [
    {
      id: 'b-venue',
      category: 'venue',
      name: 'Estate Venue & Grounds',
      percentage: 28,
      allocated_amount: 8960,
      cost_saving_tip: 'Booking Friday afternoon rather than Saturday saved $3,500 in rental fees.',
      items: [
        { name: 'Lawn & Barrel Room Exclusive Hire (8 hrs)', estimated_cost: 7200, priority: 'must-have' },
        { name: 'Bridal Suite & Groom Lounge Access', estimated_cost: 1000, priority: 'must-have' },
        { name: 'Post-event cleaning & waste recycling', estimated_cost: 760, priority: 'must-have' },
      ],
    },
    {
      id: 'b-catering',
      category: 'catering',
      name: 'Farm-to-Table Dinner & Wine Bar',
      percentage: 34,
      allocated_amount: 10880,
      cost_saving_tip: 'Opting for estate wine pairing by the case instead of open bar per-head saved 18%.',
      items: [
        { name: '3-Course Plated Seasonal Dinner (120 guests)', estimated_cost: 7800, priority: 'must-have' },
        { name: 'Sommelier Wine & Craft Beer Bar', estimated_cost: 2100, priority: 'must-have' },
        { name: 'Artisan 3-tier Olive Oil Citrus Cake', estimated_cost: 980, priority: 'nice-to-have' },
      ],
    },
    {
      id: 'b-media',
      category: 'media',
      name: 'Photography & Highlight Film',
      percentage: 12,
      allocated_amount: 3840,
      cost_saving_tip: 'Single lead shooter for prep with secondary shooter arriving for ceremony and sunset portraits.',
      items: [
        { name: 'Lead Photographer (8 hours coverage + gallery)', estimated_cost: 2600, priority: 'must-have' },
        { name: 'Drone Aerial Footage & 4-min Highlight Film', estimated_cost: 1240, priority: 'nice-to-have' },
      ],
    },
    {
      id: 'b-decor',
      category: 'decor',
      name: 'Florals & Ambient Lighting',
      percentage: 9,
      allocated_amount: 2880,
      cost_saving_tip: 'Repurposing ceremony floral arch arrangements as backdrop for the sweetheart table.',
      items: [
        { name: 'Ceremony Floral Arch & Bridal Bouquets', estimated_cost: 1700, priority: 'must-have' },
        { name: 'Table centerpieces, foliage & candlelight', estimated_cost: 1180, priority: 'must-have' },
      ],
    },
    {
      id: 'b-entertainment',
      category: 'entertainment',
      name: 'Acoustic Strings & Evening DJ',
      percentage: 7,
      allocated_amount: 2240,
      cost_saving_tip: 'Booking a versatile multi-instrumentalist who plays acoustic guitar for ceremony and transitions to live DJ.',
      items: [
        { name: 'Live Acoustic Guitarist for Ceremony & Cocktail', estimated_cost: 900, priority: 'must-have' },
        { name: 'Pro DJ & Sound Setup with Wireless Microphones', estimated_cost: 1340, priority: 'must-have' },
      ],
    },
  ],
  contingency_fund: {
    percentage: 10,
    amount: 3200,
    rationale:
      'Reserved for unexpected weather tenting, transportation surge, or overtime vendor extensions.',
  },
  timeline_phases: [
    {
      id: 'p-1',
      phase_name: '6–9 Months Out',
      milestones: [
        { id: 'm-1', title: 'Lock venue contract and secure date deposit', due_window: 'Month 1', importance: 'critical' },
        { id: 'm-2', title: 'Hire lead photographer & videographer', due_window: 'Month 2', importance: 'critical' },
        { id: 'm-3', title: 'Curate guest list & send save-the-dates', due_window: 'Month 3', importance: 'standard' },
      ],
    },
    {
      id: 'p-2',
      phase_name: '2–4 Months Out',
      milestones: [
        { id: 'm-4', title: 'Menu tasting & wine pairing selection', due_window: 'Month 5', importance: 'critical' },
        { id: 'm-5', title: 'Floral mock-up review & rentals finalized', due_window: 'Month 6', importance: 'standard' },
        { id: 'm-6', title: 'Formal invitations dispatched with RSVP deadline', due_window: 'Month 7', importance: 'critical' },
      ],
    },
    {
      id: 'p-3',
      phase_name: 'Final 2 Weeks',
      milestones: [
        { id: 'm-7', title: 'Final headcount provided to catering kitchen', due_window: '14 Days Prior', importance: 'critical' },
        { id: 'm-8', title: 'Seating chart printed and place cards organized', due_window: '7 Days Prior', importance: 'standard' },
        { id: 'm-9', title: 'Rehearsal dinner run-through with bridal party', due_window: '1 Day Prior', importance: 'critical' },
      ],
    },
  ],
  day_of_timeline: [
    { id: 'd-1', time: '10:00 AM', activity: 'Hair & makeup prep in Bridal Suite', lead_responsible: 'Lead Stylist', notes: 'Mimosas & light brunch served' },
    { id: 'd-2', time: '01:30 PM', activity: 'Photographer arrives; detail & dress flatlays', lead_responsible: 'Lead Photographer', notes: 'Rings, invitations, shoes staged' },
    { id: 'd-3', time: '03:00 PM', activity: 'First Look & couple portraits in the vineyards', lead_responsible: 'Photographer & Planner', notes: 'Golden light pre-ceremony session' },
    { id: 'd-4', time: '04:30 PM', activity: 'Guests arrive; acoustic prelude music begins', lead_responsible: 'Venue Lead / Usher', notes: 'Welcome sparkling water & iced tea' },
    { id: 'd-5', time: '05:00 PM', activity: 'Ceremony processional begins', lead_responsible: 'Officiant', notes: 'Acoustic version of Canon in D' },
    { id: 'd-6', time: '05:40 PM', activity: 'Cocktail hour on the lawn with passed canapes', lead_responsible: 'Catering Lead', notes: 'Oyster bar & signature spritz' },
    { id: 'd-7', time: '06:45 PM', activity: 'Grand Entrance & Welcome Toast', lead_responsible: 'DJ / MC', notes: 'Guests seated in Barrel Room' },
    { id: 'd-8', time: '07:15 PM', activity: 'Plated 3-course dinner served with estate wines', lead_responsible: 'Catering Lead', notes: 'Speeches between course 1 and 2' },
    { id: 'd-9', time: '08:30 PM', activity: 'First dance & live party kicks off', lead_responsible: 'DJ', notes: 'Outdoor courtyard dancefloor opens' },
    { id: 'd-10', time: '10:00 PM', activity: 'Late-night wood-fired pizza & sparkler sendoff', lead_responsible: 'Catering & Planner', notes: 'Shuttle buses depart at 10:30 PM' },
  ],
  vendor_checklists: [
    {
      category_id: 'venue',
      category_name: 'Venue & Logistics',
      checklist_items: [
        { id: 'vc-1', task: 'Confirm noise ordinance curfew (10:00 PM outdoors)', deadline: '3 Months Prior', critical: true },
        { id: 'vc-2', task: 'Submit proof of commercial liability insurance', deadline: '30 Days Prior', critical: true },
        { id: 'vc-3', task: 'Verify electrical outlet capacity for DJ & band', deadline: '14 Days Prior', critical: false },
      ],
      contract_clauses_to_watch: [
        'Rain contingency clause for outdoor ceremony relocation to covered terrace',
        'Overtime fee rate ($350/half hour) if tear-down exceeds 11:30 PM',
      ],
    },
    {
      category_id: 'catering',
      category_name: 'Catering & Beverages',
      checklist_items: [
        { id: 'vc-4', task: 'Lock dietary restrictions (vegan, gluten-free, nut allergies)', deadline: '14 Days Prior', critical: true },
        { id: 'vc-5', task: 'Confirm vendor meals for band, photographer and coordinator', deadline: '7 Days Prior', critical: false },
        { id: 'vc-6', task: 'Verify ABC liquor permit and bartender certifications', deadline: '30 Days Prior', critical: true },
      ],
      contract_clauses_to_watch: [
        'Corkage fee waived for estate-purchased bottles; $20/bottle for outside vintage',
        'Staff tip pool calculation (ensure 20% gratuity is itemized, not double billed)',
      ],
    },
    {
      category_id: 'media',
      category_name: 'Photography & Cinema',
      checklist_items: [
        { id: 'vc-7', task: 'Send prioritized family shot list and VIP names', deadline: '7 Days Prior', critical: true },
        { id: 'vc-8', task: 'Provide day-of timeline and sunset golden hour window (6:40 PM)', deadline: '10 Days Prior', critical: false },
      ],
      contract_clauses_to_watch: [
        'Turnaround time guarantee for teaser gallery (within 72 hrs) and full edit (8 weeks)',
        'Full digital print rights and high-resolution raw file archiving',
      ],
    },
  ],
  personalized_ideas: [
    {
      id: 'pi-1',
      title: 'Bespoke Wine-Blending Ceremony',
      description: 'The couple blends two estate varietals (Cabernet & Merlot) into a personalized magnum bottle, sealed to be enjoyed on their 5th anniversary.',
      category: 'guest-experience',
      estimated_effort: 'low',
    },
    {
      id: 'pi-2',
      title: 'Vintage Audio Guestbook Station',
      description: 'A refurbished 1960s rotary telephone where guests pick up the receiver, hear a recorded welcome from the couple, and leave spoken voicemails.',
      category: 'entertainment',
      estimated_effort: 'low',
    },
    {
      id: 'pi-3',
      title: 'Foliage Chandelier Hanging Installation',
      description: 'Suspending wild olive branches and micro-twinkle fairy lights above the sweetheart table to draw the eye upwards in the barrel room.',
      category: 'decor',
      estimated_effort: 'medium',
    },
    {
      id: 'pi-4',
      title: 'Personalized Mini Olive Oil Favors',
      description: 'Bottled estate cold-pressed olive oil with custom calligraphy tags: "Infused with Love".',
      category: 'food-drink',
      estimated_effort: 'low',
    },
  ],
  questions_for_vendors: [
    'What is your rain backup relocation policy, and when is the latest call time on event day?',
    'Are there any sound decibel restrictions after 9:00 PM, and do speakers need directional baffling?',
    'What time can the florists and rental company load in on Saturday morning?',
    'Does the catering quote include linen rental, water goblets, and flatware, or are those billed through third-party rentals?',
  ],
  risks_and_mitigations: [
    {
      risk: 'Summer afternoon heat affecting guest comfort during open-air ceremony',
      mitigation: 'Distribute personalized sandalwood wooden hand-fans and provide chilled infused cucumber water upon arrival.',
      severity: 'medium',
    },
    {
      risk: 'Limited parking on historic vineyard property',
      mitigation: 'Charter two 30-passenger luxury shuttle vans running continuous loops from the downtown partner hotel.',
      severity: 'high',
    },
    {
      risk: 'Vendor load-out timing overrun risking penalty deposit deductions',
      mitigation: 'Designate day-of coordinator and 2 dedicated load-out assistants starting pack-down at 10:00 PM.',
      severity: 'low',
    },
  ],
  disclaimer:
    'Informational event planning framework generated by Planora AI. Always verify contract terms, vendor insurance requirements, and venue restrictions with your booked vendors.',
};

export const DEMO_BIRTHDAY_PLAN: PlanResult = {
  event_name: 'Neon Nostalgia — Rooftop 30th Milestone Birthday',
  event_type: 'birthday',
  guest_count: 45,
  total_budget: 6500,
  currency: '$',
  executive_summary:
    'A high-energy, stylish 30th birthday bash atop a downtown skyline terrace. Features retro 90s aesthetic elements elevated with contemporary craft mixology, interactive arcade cabinets, and an energetic DJ set.',
  theme_and_vibe: {
    theme_name: '90s Cyber Retro & Skyline Glow',
    color_palette: [
      { name: 'Midnight Navy', hex: '#1E1B4B' },
      { name: 'Electric Magenta', hex: '#EC4899' },
      { name: 'Cyan Neon', hex: '#06B6D4' },
      { name: 'Pure White', hex: '#FFFFFF' },
    ],
    aesthetic_notes:
      'Custom neon signage ("Level 30 Unlocked"), acrylic barware, chrome cocktail high-tops, and vibrant uplighting.',
    signature_touch:
      'Two vintage cocktail-table arcade machines with Street Fighter and Pac-Man set to free-play, plus custom temporary tattoo parlor.',
  },
  budget_breakdown: [
    {
      id: 'b-venue',
      category: 'venue',
      name: 'Rooftop Lounge Private Terrace',
      percentage: 35,
      allocated_amount: 2275,
      cost_saving_tip: 'Booking Sunday evening secured a 30% reduction on the venue minimum food/drink spend.',
      items: [
        { name: 'Terrace rental (5 hours with panoramic city views)', estimated_cost: 1800, priority: 'must-have' },
        { name: 'Security and cleaning fee', estimated_cost: 475, priority: 'must-have' },
      ],
    },
    {
      id: 'b-catering',
      category: 'catering',
      name: 'Artisan Sliders, Taco Bar & Craft Bar',
      percentage: 32,
      allocated_amount: 2080,
      cost_saving_tip: 'Serving elevated heavy tapas and street-food stations rather than sit-down dining kept costs predictable.',
      items: [
        { name: 'Passed gourmet sliders, street tacos & bao buns', estimated_cost: 1350, priority: 'must-have' },
        { name: 'Signature cocktail punch bowls & craft beer allowance', estimated_cost: 730, priority: 'must-have' },
      ],
    },
    {
      id: 'b-decor',
      category: 'decor',
      name: 'Neon Signage & Retro Styling',
      percentage: 12,
      allocated_amount: 780,
      cost_saving_tip: 'Rented the "Level 30 Unlocked" LED neon sign instead of custom fabrication.',
      items: [
        { name: 'Custom Neon photo backdrop & balloon arch', estimated_cost: 480, priority: 'must-have' },
        { name: 'Glow accessories, custom cups & party favors', estimated_cost: 300, priority: 'nice-to-have' },
      ],
    },
    {
      id: 'b-entertainment',
      category: 'entertainment',
      name: 'Retro Arcade Cabinets & DJ',
      percentage: 13,
      allocated_amount: 845,
      cost_saving_tip: 'Rented plug-and-play bartop arcade units with local delivery.',
      items: [
        { name: 'Live open-format DJ with sound & lighting rig', estimated_cost: 650, priority: 'must-have' },
        { name: '2 retro arcade consoles rental for 24 hrs', estimated_cost: 195, priority: 'nice-to-have' },
      ],
    },
  ],
  contingency_fund: {
    percentage: 8,
    amount: 520,
    rationale: 'Buffer for extra bar tabs or extended DJ overtime.',
  },
  timeline_phases: [
    {
      id: 'p-1',
      phase_name: '4 Weeks Out',
      milestones: [
        { id: 'm-1', title: 'Confirm rooftop venue deposit & bar minimum', due_window: 'Week 1', importance: 'critical' },
        { id: 'm-2', title: 'Send digital animated invites via Partiful/Paperless', due_window: 'Week 1', importance: 'standard' },
      ],
    },
    {
      id: 'p-2',
      phase_name: '1–2 Weeks Out',
      milestones: [
        { id: 'm-3', title: 'Finalize custom neon signage delivery and pickup slot', due_window: '10 Days Prior', importance: 'standard' },
        { id: 'm-4', title: 'Lock DJ playlist must-plays and guest shoutouts', due_window: '7 Days Prior', importance: 'standard' },
        { id: 'm-5', title: 'Order retro custom birthday cake or dessert tower', due_window: '5 Days Prior', importance: 'critical' },
      ],
    },
  ],
  day_of_timeline: [
    { id: 'd-1', time: '05:30 PM', activity: 'Host & vendors load-in; DJ soundcheck', lead_responsible: 'Host / DJ', notes: 'Check neon backdrop lights' },
    { id: 'd-2', time: '07:00 PM', activity: 'Doors open; welcome cocktails & DJ upbeat vibes', lead_responsible: 'Rooftop Staff', notes: 'Serve signature "Cyber 30" cocktail' },
    { id: 'd-3', time: '08:00 PM', activity: 'Gourmet street taco and slider bars open', lead_responsible: 'Catering Lead', notes: 'Food served hot over 90 mins' },
    { id: 'd-4', time: '09:15 PM', activity: 'Toast, birthday tribute & cake cutting moment', lead_responsible: 'Best Friend / Host', notes: 'Sparkler candles on cake' },
    { id: 'd-5', time: '09:30 PM', activity: 'High-energy dance set & arcade challenge finals', lead_responsible: 'DJ', notes: 'Glowsticks distributed to dancefloor' },
    { id: 'd-6', time: '12:00 AM', activity: 'Event concludes; guests transition or depart', lead_responsible: 'Venue Lead', notes: 'All guest belongings secured' },
  ],
  vendor_checklists: [
    {
      category_id: 'venue',
      category_name: 'Rooftop Venue Rules',
      checklist_items: [
        { id: 'vc-1', task: 'Confirm all guests are 21+ with government photo ID', deadline: 'Day Of', critical: true },
        { id: 'vc-2', task: 'Verify weather glass enclosure operation in case of wind', deadline: '2 Days Prior', critical: true },
      ],
      contract_clauses_to_watch: [
        'Wind gust thresholds requiring outdoor terrace heaters or indoor transfer',
        'Automatic 20% gratuity on all bar tabs',
      ],
    },
  ],
  personalized_ideas: [
    {
      id: 'pi-1',
      title: 'Throwback Nostalgia Photo Wall',
      description: 'A chronological Polaroid-style collage of the birthday celebrant through every year from 1996 to today.',
      category: 'decor',
      estimated_effort: 'low',
    },
    {
      id: 'pi-2',
      title: 'Custom "Level 30" Temporary Tattoo Bar',
      description: 'Gold foil and neon temporary tattoos with the celebrant\'s funny quotes and iconic catchphrases.',
      category: 'entertainment',
      estimated_effort: 'low',
    },
  ],
  questions_for_vendors: [
    'Can outside desserts/cakes be brought in without a plating fee?',
    'What is the cutoff time for outdoor music volume on the terrace?',
  ],
  risks_and_mitigations: [
    {
      risk: 'Sudden rain or chilly rooftop winds',
      mitigation: 'The venue features automated retractable glass awnings and infrared radiant heaters.',
      severity: 'low',
    },
  ],
  disclaimer:
    'Informational event planning framework generated by Planora AI. Always verify contract terms and venue rules with booked partners.',
};

export const DEMO_COMMUNITY_PLAN: PlanResult = {
  event_name: 'Sunset Green — Community Arts & Food Festival',
  event_type: 'community',
  guest_count: 350,
  total_budget: 14000,
  currency: '$',
  executive_summary:
    'A vibrant, family-friendly outdoor festival celebrating local grassroots makers, musicians, and zero-waste initiatives. Organizes volunteer shifts, vendor logistics, city sound permits, and diverse cultural stages.',
  theme_and_vibe: {
    theme_name: 'Grassroots Green & Creative Commons',
    color_palette: [
      { name: 'Forest Moss', hex: '#15803D' },
      { name: 'Sunburst Amber', hex: '#F59E0B' },
      { name: 'Terracotta', hex: '#C2410C' },
      { name: 'Clean White', hex: '#FFFFFF' },
    ],
    aesthetic_notes:
      'Upcycled wood signage, natural burlap shades, vibrant community art displays, and potted native plant decor.',
    signature_touch:
      'Community mural canvas where every attendee paints a square to be permanently installed in the town community center.',
  },
  budget_breakdown: [
    {
      id: 'b-venue',
      category: 'venue',
      name: 'City Park Permits, Tents & Stage',
      percentage: 26,
      allocated_amount: 3640,
      cost_saving_tip: 'Partnered with city parks department for municipal non-profit fee waiver.',
      items: [
        { name: 'Park special event permit & police inspection', estimated_cost: 840, priority: 'must-have' },
        { name: 'Covered central stage & canopy tents rental', estimated_cost: 2100, priority: 'must-have' },
        { name: 'Portable ADA restrooms and hand-wash stations', estimated_cost: 700, priority: 'must-have' },
      ],
    },
    {
      id: 'b-logistics',
      category: 'logistics',
      name: 'Sound System, Generators & Waste Management',
      percentage: 24,
      allocated_amount: 3360,
      cost_saving_tip: 'Zero-waste volunteer team sorting compostable and recyclable bins directly.',
      items: [
        { name: 'Solar generator & dual PA sound systems', estimated_cost: 1800, priority: 'must-have' },
        { name: 'Three-stream compost, recycle, and landfill bins', estimated_cost: 560, priority: 'must-have' },
        { name: 'First aid tent, emergency AED & volunteer vests', estimated_cost: 1000, priority: 'must-have' },
      ],
    },
    {
      id: 'b-entertainment',
      category: 'entertainment',
      name: 'Local Musicians, Kids Zone & Workshops',
      percentage: 22,
      allocated_amount: 3080,
      cost_saving_tip: 'Offering featured stage slots to local school bands alongside headliner folk band.',
      items: [
        { name: '3 local indie/folk bands & sound engineer honorarium', estimated_cost: 1800, priority: 'must-have' },
        { name: 'Face painter, balloon artist & giant lawn games', estimated_cost: 780, priority: 'must-have' },
        { name: 'Artisan workshop supplies (pottery & seed planting)', estimated_cost: 500, priority: 'nice-to-have' },
      ],
    },
    {
      id: 'b-decor',
      category: 'decor',
      name: 'Signage, Wayfinding & Community Canvas',
      percentage: 16,
      allocated_amount: 2240,
      cost_saving_tip: 'High-school art class painted recycled plywood wayfinding boards.',
      items: [
        { name: 'Giant interactive community mural canvas & paints', estimated_cost: 640, priority: 'must-have' },
        { name: 'Site maps, banners & volunteer directional signage', estimated_cost: 900, priority: 'must-have' },
        { name: 'Festive bunting flags & shade sails', estimated_cost: 700, priority: 'nice-to-have' },
      ],
    },
  ],
  contingency_fund: {
    percentage: 12,
    amount: 1680,
    rationale: 'Reserved for weather contingencies, extra security staffing, or city permit adjustments.',
  },
  timeline_phases: [
    {
      id: 'p-1',
      phase_name: '3 Months Prior',
      milestones: [
        { id: 'm-1', title: 'Submit park application & sound permit to City Council', due_window: 'Month 1', importance: 'critical' },
        { id: 'm-2', title: 'Open food truck and artisan booth vendor applications', due_window: 'Month 1', importance: 'critical' },
      ],
    },
    {
      id: 'p-2',
      phase_name: '1 Month Prior',
      milestones: [
        { id: 'm-3', title: 'Finalize stage schedule and musical sound checks', due_window: '3 Weeks Prior', importance: 'standard' },
        { id: 'm-4', title: 'Hold volunteer orientation & safety walk-through', due_window: '2 Weeks Prior', importance: 'critical' },
      ],
    },
  ],
  day_of_timeline: [
    { id: 'd-1', time: '07:30 AM', activity: 'Logistics crew arrives; stage & tent erection', lead_responsible: 'Operations Lead', notes: 'Generator inspection' },
    { id: 'd-2', time: '09:30 AM', activity: 'Food trucks & artisan vendor load-in and health check', lead_responsible: 'Vendor Coordinator', notes: 'Check food handler permits' },
    { id: 'd-3', time: '11:00 AM', activity: 'Gates open to public; Acoustic stage opens', lead_responsible: 'Festival Chair', notes: 'Mayor ribbon-cutting at main arch' },
    { id: 'd-4', time: '01:00 PM', activity: 'Kids zone games & community mural workshop kickoff', lead_responsible: 'Youth Director', notes: 'Eco-friendly washable paints' },
    { id: 'd-5', time: '03:30 PM', activity: 'Headline community band performs on main stage', lead_responsible: 'Sound Engineer', notes: 'Crowd peak anticipated' },
    { id: 'd-6', time: '06:00 PM', activity: 'Closing remarks, volunteer thank-you, and pack-down', lead_responsible: 'Operations Lead', notes: 'Site cleaned and returned to city' },
  ],
  vendor_checklists: [
    {
      category_id: 'venue',
      category_name: 'Municipal Compliance',
      checklist_items: [
        { id: 'vc-1', task: 'Obtain approved City Parks Amplified Sound Permit', deadline: '30 Days Prior', critical: true },
        { id: 'vc-2', task: 'Coordinate Fire Marshal clearance for food truck propane tanks', deadline: '14 Days Prior', critical: true },
        { id: 'vc-3', task: 'Arrange curbside parking cones and traffic flow signs', deadline: '2 Days Prior', critical: false },
      ],
      contract_clauses_to_watch: [
        'Park turf protection bond: refundable $1,000 security deposit subject to grass condition',
        'Curfew: all amplified sound must cease promptly at 6:00 PM',
      ],
    },
  ],
  personalized_ideas: [
    {
      id: 'pi-1',
      title: 'Community Collaborative Mural',
      description: 'A 16-foot canvas divided into 100 numbered squares, inviting attendees of all ages to paint their piece of local culture.',
      category: 'guest-experience',
      estimated_effort: 'medium',
    },
    {
      id: 'pi-2',
      title: 'Seed Bomb & Native Plant Giveaways',
      description: 'Hands-on booth where kids roll clay and wildflower seeds to take home and plant in their backyards.',
      category: 'decor',
      estimated_effort: 'low',
    },
  ],
  questions_for_vendors: [
    'Are all your food packaging materials 100% commercially compostable?',
    'What electrical wattage does your equipment draw from our generator?',
  ],
  risks_and_mitigations: [
    {
      risk: 'Unplanned power outage on main audio stage',
      mitigation: 'Dual redundant solar batteries wired with auto-failover switch.',
      severity: 'high',
    },
  ],
  disclaimer:
    'Informational community event plan generated by Planora AI. Ensure all municipal permits, fire codes, and public insurance certificates are legally secured.',
};

export const DEMO_PLANS_BY_TYPE: Record<EventTypeId, PlanResult> = {
  wedding: DEMO_WEDDING_PLAN,
  birthday: DEMO_BIRTHDAY_PLAN,
  community: DEMO_COMMUNITY_PLAN,
  'gala-fundraiser': {
    ...DEMO_WEDDING_PLAN,
    event_name: 'Starlight Hope — 15th Annual Children\'s Charity Gala',
    event_type: 'gala-fundraiser',
    guest_count: 150,
    total_budget: 40000,
    budget_breakdown: rescaleBudgetCategories(DEMO_WEDDING_PLAN.budget_breakdown, 40000, 10),
    contingency_fund: {
      percentage: 10,
      amount: 4000,
      rationale: 'Reserved for live auction staging, audio-visual failover, and VIP donor reception.',
    },
    executive_summary:
      'A black-tie fundraising gala featuring a silent auction, keynote addresses from hospital leadership, fine dining, and live donor matching. Designed for maximum donor engagement and seamless banquet flow.',
  },
};

