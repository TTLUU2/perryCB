import { LearningModule } from '../types';

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'first-90-days',
    title: 'First 90 Days with Your Card',
    description: 'Everything you need to know after getting your first points-earning credit card.',
    color: 'blue',
    lessons: [
      {
        id: 'choosing-first-card',
        title: 'Choosing Your First Points Card',
        durationMinutes: 4,
        askPerryPrompt: 'I want to choose my first points credit card. Can you help me find the best option?',
        askPerryPrompts: [
          'Help me find the best first points card',
          'How do I compare sign-up bonuses?',
          'What card perks are actually worth paying for?',
        ],
        content: `Choosing your first points-earning credit card is one of the most important decisions in your frequent flyer journey. The right card can set you up with enough points for a premium cabin flight within months, while the wrong choice might leave you paying high fees for little return.

**Start with your travel goals**

Before comparing cards, ask yourself: where do I want to fly, and in what cabin? If you dream of Qantas Business Class to London, a Qantas-earning card makes sense. If you want flexibility across multiple airlines, consider Amex Membership Rewards or a Velocity-earning card with transfer partners.

**Key factors to compare**

- **Sign-up bonus:** This is often the single biggest points earn you'll ever get from a card. Look for bonuses of 60,000 points or more.
- **Minimum spend:** Most bonuses require you to spend a certain amount (e.g., $3,000) within a set period (usually 3 months). Make sure you can meet this through normal spending — never spend extra just to hit a target.
- **Annual fee:** Higher-fee cards usually earn more points per dollar and come with perks like lounge access or travel insurance. But only pay for perks you'll actually use.
- **Ongoing earn rate:** After the bonus, you'll earn 0.5–1.5 points per dollar on everyday spending. Cards with higher earn rates pay off over time.
- **Complementary benefits:** Travel insurance, lounge passes, companion fares, and fee-free foreign transactions can add hundreds of dollars in value.

**Common first-card strategies**

Many beginners start with a card that has a strong sign-up bonus and a first-year annual fee waiver or discount. This lets you test whether the card fits your lifestyle before committing to the full fee. If the card doesn't suit you after 12 months, you can downgrade or switch.

**Tip:** If you're unsure which program to start with, Qantas Frequent Flyer has the most earn partners in Australia and the widest range of redemption options for beginners.

**One card at a time**

Resist the urge to apply for multiple cards at once. Each application triggers a credit check, and too many in a short period can affect your credit score. Start with one card, learn the ropes, and expand your strategy later.`,
      },
      {
        id: 'hitting-signup-bonus',
        title: 'Hitting Your Sign-Up Bonus',
        durationMinutes: 4,
        askPerryPrompt: 'I just got a new card. Can you help me plan how to hit the sign-up bonus?',
        askPerryPrompts: [
          'Help me plan to hit my sign-up bonus',
          'What expenses count towards minimum spend?',
          'How do I track my bonus progress?',
        ],
        content: `The sign-up bonus is the single fastest way to earn a large chunk of points. Many cards offer 60,000 to 120,000 bonus points — enough for a one-way Business Class flight to Asia or beyond. But you need to hit the minimum spend requirement within the qualifying period.

**Understand the terms**

When you receive your card, check three things: the bonus amount, the minimum spend threshold, and the time window. For example, "Earn 100,000 Qantas Points when you spend $3,000 in the first 3 months." The clock usually starts from card approval, not when you receive the physical card.

**Plan your spending**

Map out your regular expenses that you can shift to the new card:

- **Bills:** Utilities, internet, phone, insurance premiums, streaming subscriptions
- **Groceries:** Your weekly supermarket shop adds up quickly
- **Fuel:** If your card earns bonus points at petrol stations, even better
- **Upcoming purchases:** Were you planning to buy furniture, electronics, or pay for a holiday? Time these with your new card

**What counts as eligible spend**

Most purchases count, but some common exclusions are: balance transfers, cash advances, government payments (ATO, council rates), and gambling transactions. Gift card purchases from supermarkets usually count as grocery spending, but check your card's terms.

**Track your progress**

Log in to your card's app or online portal regularly to check your running total. Don't wait until the deadline to discover you're short. Some card issuers show a progress tracker for the bonus — use it.

**Warning:** Never spend money you wouldn't normally spend just to chase a sign-up bonus. If you end up paying interest on a credit card balance, the cost will far outweigh the value of any bonus points.

**Don't overspend**

The golden rule: never buy things you wouldn't normally buy just to hit the target. If you can't meet the minimum spend through natural spending, the card might not be right for you. The bonus points aren't worth it if you end up carrying a balance and paying interest.

**After the bonus posts**

Points usually appear on your statement within 1–2 billing cycles after meeting the requirement. If they don't, call the issuer. Once they land in your frequent flyer account, they're yours — start planning that redemption.`,
      },
      {
        id: 'everyday-earning',
        title: 'Set Up Everyday Earning',
        durationMinutes: 3,
        askPerryPrompt: 'How can I maximise my everyday spending to earn more points?',
        askPerryPrompts: [
          'How do I maximise everyday points earning?',
          'Which bills should I put on my points card?',
          'How do bonus earning categories work?',
        ],
        content: `Once you've pocketed your sign-up bonus, the next step is maximising points from your daily spending. This is where consistent, long-term earning happens — and small optimisations add up to thousands of extra points per year.

**Make your card your default**

Set your points-earning card as the default payment method everywhere: Apple Pay or Google Pay on your phone, online shopping accounts, subscription services, and recurring bills. Every dollar spent on a non-earning card is points left on the table.

**Understand your earn rates**

Most cards have tiered earn rates. For example, you might earn 1.5 points per dollar at supermarkets but only 0.5 points per dollar on general spending. Know your card's bonus categories and direct your spending accordingly.

**Stack with loyalty programs**

When you shop at Woolworths, scan your Everyday Rewards card AND pay with your points-earning credit card. You'll earn Woolworths points plus credit card points on the same transaction. The same applies to Flybuys at Coles, or any merchant loyalty program.

**Use your card for bills**

Rent, insurance, utilities, phone bills, and subscriptions can often be paid by credit card. Some billers charge a surcharge for card payments — calculate whether the points earned outweigh the fee. At 1 point per dollar and a 1% surcharge, you're roughly breaking even on most programs.

**Automate everything**

Set up direct debits for your card's full balance each month. This ensures you never pay interest (which would wipe out the value of any points earned) and means you don't have to remember payment dates.

**Monthly check-in**

Once a month, review your statement to make sure all transactions are earning the correct points. Occasionally, merchant category codes get misclassified, and you might miss out on bonus category rates. If something looks wrong, contact your card issuer.

**The daily coffee test**

Even a $5 coffee earns you 5 points. Over a year of weekday coffees, that's 1,300 points — just from your morning flat white. Now multiply that thinking across all your spending.`,
      },
      {
        id: 'beginner-mistakes',
        title: 'Common Beginner Mistakes',
        durationMinutes: 3,
        askPerryPrompt: 'What are the biggest mistakes I should avoid as a new points collector?',
        askPerryPrompts: [
          'What mistakes should I avoid with points?',
          'How do I stop my points from expiring?',
          'Is a high annual fee ever worth it?',
        ],
        content: `Every points collector makes a few mistakes early on. Here are the most common ones — and how to avoid them so you don't waste points, pay unnecessary fees, or miss out on value.

**Paying interest on your card**

This is the number one mistake. If you carry a credit card balance and pay interest, the cost will almost certainly exceed the value of any points you earn. Always pay your full statement balance by the due date. If you can't do that consistently, a points-earning card isn't the right product for you right now.

**Letting points expire**

Most frequent flyer programs have activity-based expiry. Qantas Points expire after 18 months of no earning or redemption activity. Velocity Points expire after 24 months. Set a calendar reminder and make sure you have at least one earning transaction in each period — even a small online shop through the program's shopping portal counts.

**Hoarding points indefinitely**

Points generally lose value over time as programs adjust redemption pricing. Don't stockpile points "for someday." Set a specific goal — a Business Class trip to Japan, a domestic return flight — and redeem once you have enough. A point spent today is worth more than a point spent in three years.

**Ignoring fees vs. value**

A $450 annual fee sounds steep, but if the card gives you 2 lounge passes ($80 value), travel insurance ($200+ value), and earns you 40,000 points a year ($500+ value), you're well ahead. Always calculate the total value of benefits against the fee. Conversely, don't keep a high-fee card if you aren't using the perks.

**Applying for too many cards at once**

Each credit card application creates a hard inquiry on your credit report. Multiple inquiries in a short period can lower your credit score and may cause banks to reject future applications. Space applications at least 3–6 months apart.

**Not reading the fine print**

Bonus point offers often come with conditions: minimum spend periods, excluded transaction types, caps on bonus earning categories. Spend 10 minutes reading the terms before you apply. It could save you from missing out on tens of thousands of points.

**Forgetting to actually use your points**

It sounds obvious, but many people accumulate points and never redeem them. Points are a currency — they have no value sitting in your account. Start planning your first redemption as soon as you have a meaningful balance.`,
      },
    ],
  },
  {
    id: 'earning',
    title: 'Earning Points',
    description: 'Advanced strategies to accelerate your points balance beyond credit card spending.',
    color: 'orange',
    lessons: [
      {
        id: 'credit-card-strategies',
        title: 'Credit Card Earning Strategies',
        durationMinutes: 5,
        askPerryPrompt: 'Can you help me build an advanced credit card points strategy?',
        askPerryPrompts: [
          'Help me build a card points strategy',
          'How does strategic card pairing work?',
          'Should I negotiate my annual fee?',
        ],
        content: `Once you've mastered the basics, there are several strategies to significantly accelerate your credit card points earning. These techniques are used by experienced points collectors to earn hundreds of thousands of points per year.

**Strategic card pairing**

Instead of putting all spending on one card, use two or three cards to maximise bonus categories. For example, use a card that earns 3x points at supermarkets for grocery spending, and a different card with 2x points on dining for restaurants. Your "everyday" card covers everything else. This can increase your effective earn rate by 50–100%.

**Timing large purchases**

If you know you have a big expense coming — new furniture, a holiday, car insurance — time it with a new card application to help meet the sign-up bonus. Alternatively, if you're close to a points milestone on your existing card, a large purchase can push you over the line.

**Annual fee negotiation**

Before your card anniversary, call your issuer and ask about retention offers. Banks often have unpublished offers: bonus points, fee waivers, or statement credits to keep you as a customer. The worst they can say is no, and many collectors save hundreds of dollars this year through a simple phone call.

**Companion cards and supplementary cards**

Some premium cards let you add supplementary cardholders at no extra cost, and their spending earns points into your account. If your partner or family member has regular spending, a supplementary card effectively doubles your earning power.

**Points-earning debit alternatives**

If credit cards aren't for you, some debit cards and prepaid cards now earn frequent flyer points. The earn rate is usually lower (0.25–0.5 points per dollar), but there's no risk of interest charges. Examples include the Qantas Transaction Account and various bank debit card offers.

**Maximise bonus categories**

Many cards offer temporary promotions like "earn 5x points at selected retailers this month." Keep an eye on emails and app notifications from your card issuer. These promotions can make a huge difference if you time your spending right.

**The two-card minimum strategy**

At a minimum, most experienced collectors carry one premium card for high-value perks and bonus categories, plus one no-annual-fee card for low-value transactions where the points earned wouldn't justify a fee.`,
      },
      {
        id: 'shopping-portals',
        title: 'Shopping Portals & Partner Offers',
        durationMinutes: 4,
        askPerryPrompt: 'How do I use shopping portals to earn extra points?',
        askPerryPrompts: [
          'How do shopping portals work?',
          'What\u2019s the best way to stack points?',
          'Which portal has the best offers right now?',
        ],
        content: `Shopping portals are one of the most underused tools in the points collector's toolkit. By clicking through an airline's online shopping portal before making a purchase you were going to make anyway, you can earn thousands of bonus points for free.

**How shopping portals work**

Airlines partner with hundreds of online retailers. When you access these retailers through the airline's shopping portal (instead of going directly to the store's website), the airline tracks your purchase and credits bonus points to your account. You still pay the same price — the retailer pays the airline a commission, which gets passed to you as points.

**Australian frequent flyer shopping portals**

- **Qantas Shopping:** Hundreds of Australian and international retailers. Earn 1–10+ Qantas Points per dollar spent. Major partners include The Iconic, Apple, Microsoft, Booking.com, and many more.
- **Velocity eStore:** Similar concept for Velocity members. Partners include Myer, David Jones, Adidas, and various travel brands.

**Stacking for maximum points**

The real power of portals is stacking. On a single $200 purchase at a participating retailer, you can earn:

1. Portal bonus points (e.g., 5 Qantas Points per $1 = 1,000 points)
2. Credit card points (e.g., 1 point per $1 = 200 points)
3. Retailer loyalty points (e.g., Everyday Rewards or Flybuys)

That's triple-dipping on the same transaction for 1,200+ points on a $200 spend.

**Key Point:** The real power of shopping portals is stacking — you can earn portal bonus points, credit card points, and retailer loyalty points all on the same purchase.

**Tips for portal success**

- **Clear your cookies** before clicking through the portal, or use a private/incognito browser window. This ensures the tracking link works properly.
- **Don't navigate away** from the retailer's site after clicking through. Complete your purchase in the same session.
- **Check for bonus promotions.** Portals frequently run double or triple points events, especially around Black Friday, Click Frenzy, and end of financial year.
- **Be patient.** Portal points can take 4–8 weeks to appear in your account after purchase.

**Partner offers beyond shopping**

Airlines also offer points for non-shopping activities: completing surveys, signing up for services, booking hotels through their portals, or dining at partner restaurants. Check your program's "earn" page regularly for new offers.`,
      },
      {
        id: 'transfer-partners',
        title: 'Transfer Partners Explained',
        durationMinutes: 5,
        askPerryPrompt: 'Can you help me find the best transfer option for my points?',
        askPerryPrompts: [
          'Find the best transfer option for my points',
          'When should I transfer Amex points?',
          'How do transfer bonuses work?',
        ],
        content: `Transfer partners are the secret weapon of advanced points collectors. They allow you to move points between programs, unlocking redemption options that wouldn't be available if you stayed within a single program.

**What are transfer partners?**

Certain credit card rewards programs — like American Express Membership Rewards — let you transfer points to multiple airline and hotel loyalty programs. Instead of being locked into one airline, you can choose where to send your points based on which program offers the best value for your specific trip.

**Key Australian transfer partnerships**

**Amex Membership Rewards** transfers to:
- Qantas Frequent Flyer
- Velocity Frequent Flyer
- Singapore Airlines KrisFlyer
- Cathay Pacific Asia Miles
- Hilton Honors, Marriott Bonvoy

The transfer ratio varies by program. Amex MR to Qantas is typically 2:1 (2 MR points = 1 Qantas Point for the gateway card, or 1:1 for premium cards). To Velocity, it's often 1:1 on premium cards.

**Warning:** Never transfer points speculatively. Only transfer when you have a specific redemption in mind and have confirmed seat availability. Once transferred, points generally cannot be moved back.

**When to transfer**

The golden rule is: **never transfer points speculatively.** Only transfer when you have a specific redemption in mind and have confirmed seat availability. Once points are transferred, you generally can't move them back.

Steps to follow:

1. Find the flight or hotel you want to book
2. Confirm reward availability
3. Check how many points you need in that program
4. Calculate whether transferring gives better value than other options
5. Transfer only the exact amount needed
6. Book immediately after points land (usually instant to 24 hours)

**Transfer bonuses**

Programs periodically offer transfer bonuses — for example, "Transfer to Velocity this month and get 15% bonus points." These promotions can significantly boost value. Sign up for email alerts from your credit card program so you don't miss them.

**Points value comparison**

Not all points are worth the same. As a rough guide for Australian collectors:

- 1 Qantas Point ≈ 1.5–2.5 cents (depending on redemption)
- 1 Velocity Point ≈ 1.5–2.2 cents
- 1 KrisFlyer Mile ≈ 2–3.5 cents
- 1 Asia Mile ≈ 1.5–2.5 cents

Always calculate the cents-per-point value of your planned redemption to decide which transfer makes the most sense.`,
      },
      {
        id: 'earning-without-credit-card',
        title: 'Earning Without a Credit Card',
        durationMinutes: 4,
        askPerryPrompt: 'What are the best ways to earn frequent flyer points without a credit card?',
        askPerryPrompts: [
          'How do I earn points without a credit card?',
          'Can I earn Qantas Points from groceries?',
          'How many points can I earn without a card?',
        ],
        content: `You don't need a credit card to build a healthy points balance. There are dozens of ways to earn frequent flyer points through everyday activities, purchases, and partnerships — no credit check required.

**Frequent flyer program earning partners**

Airlines partner with a wide range of businesses that credit points directly to your frequent flyer account:

- **Supermarkets:** Woolworths Everyday Rewards members can convert points to Qantas Points. Flybuys members at Coles can convert to Velocity Points.
- **Fuel:** BP rewards earns Qantas Points (2 points per litre for Plus members). Shell Coles Express links to Flybuys/Velocity.
- **Utilities:** Some energy providers offer sign-up bonuses of 10,000–20,000 points when you join, plus ongoing earning.
- **Insurance:** Certain health insurance, car insurance, and home insurance providers offer frequent flyer points for new policies.

**Dining and entertainment**

- **Qantas Dining Rewards** and similar programs earn points when you dine at participating restaurants — simply register your regular credit or debit card and points are earned automatically.
- **Hotel stays:** Book accommodation through an airline's hotel portal for bonus points on top of any hotel loyalty program points.

**Flying (yes, actually flying)**

Don't forget that flying earns points too! Even if you book a cheap economy fare, make sure your frequent flyer number is attached to every booking. Status credits from flying also contribute to elite status tiers, which come with bonus earning multipliers.

**Shopping portals with debit cards**

The shopping portals mentioned in the previous lesson work with any payment method — credit card, debit card, or even PayPal. The portal bonus points are earned regardless of how you pay.

**Surveys, apps, and micro-earning**

Several platforms offer small amounts of frequent flyer points for activities like:
- Completing surveys
- Watching videos
- Downloading and trying apps
- Scanning shopping receipts

Individually small, these can add up to a few thousand points per year with minimal effort.

**Referral bonuses**

Many programs offer points when you refer friends and family to credit cards or services. Some referral bonuses are worth 10,000–20,000 points per successful referral.

**The non-credit-card strategy**

By combining supermarket earning, fuel, utilities, dining, and shopping portals, it's realistic to earn 30,000–50,000 points per year without a credit card. That's enough for a domestic return flight in economy every year — completely free.`,
      },
    ],
  },
  {
    id: 'redeeming',
    title: 'Redeeming Points',
    description: 'How to get maximum value when spending your hard-earned points.',
    color: 'green',
    lessons: [
      {
        id: 'understanding-points-value',
        title: 'Understanding Points Value',
        durationMinutes: 4,
        askPerryPrompt: 'How do I calculate whether a points redemption is good value?',
        askPerryPrompts: [
          'How do I calculate points redemption value?',
          'What\u2019s a good cents-per-point target?',
          'When should I pay cash instead of points?',
        ],
        content: `Not all point redemptions are created equal. The same 80,000 points could get you a $400 economy flight or a $4,000 Business Class seat. Understanding how to measure and maximise the value of your points is essential.

**Cents per point (cpp)**

The standard way to measure redemption value is cents per point. Divide the cash price of what you're booking by the number of points required:

**Value (cpp) = Cash Price ÷ Points Required × 100**

For example, if a Business Class flight costs $4,000 cash or 80,000 points:
$4,000 ÷ 80,000 × 100 = **5 cents per point**

A domestic economy flight costing $200 or 16,000 points:
$200 ÷ 16,000 × 100 = **1.25 cents per point**

The Business Class redemption delivers 4x more value per point.

**Good vs. great value benchmarks**

For Qantas Points, rough benchmarks are:

- Below 1 cpp: Poor value (gift cards, merchandise)
- 1–1.5 cpp: Acceptable (domestic economy)
- 1.5–2.5 cpp: Good value (international economy, domestic business)
- 2.5–5 cpp: Great value (international business class)
- 5+ cpp: Exceptional (international first class)

Velocity Points follow a similar pattern, though the absolute numbers differ.

**Key Point:** Always calculate cents per point before redeeming. Premium cabin flights typically deliver 3-6x more value per point than economy redemptions.

**Where points shine**

Points deliver the best value when the cash price is high but the points price is relatively low. This typically happens with:

- **Premium cabin flights:** Business and First Class have huge cash prices but proportionally lower points requirements.
- **Peak travel periods:** When cash fares spike during school holidays or Christmas, points bookings often stay the same price.
- **Long-haul routes:** Points prices don't scale linearly with distance, so longer flights tend to offer better per-point value.

**Where points disappoint**

Some redemptions offer poor value:

- **Merchandise and gift cards:** You'll typically get 0.3–0.7 cpp. Almost always a bad deal.
- **Points + Pay:** Using points to reduce a cash fare often values points at less than 1 cpp.
- **Short domestic flights:** When the cash fare is already cheap ($100–150), using points doesn't make sense unless you have no other use for them.

**The opportunity cost mindset**

Always ask: "Could I get more value from these points another way?" If you're about to spend 20,000 points on a $150 domestic flight, consider saving them toward a Business Class redemption where they'd be worth $500+.`,
      },
      {
        id: 'finding-availability',
        title: 'Finding Reward Seat Availability',
        durationMinutes: 5,
        askPerryPrompt: 'Can you help me find reward seat availability for an upcoming trip?',
        askPerryPrompts: [
          'Help me find reward seat availability',
          'What tools help search for award seats?',
          'When is the best time to find Business Class?',
        ],
        content: `The biggest frustration in the points world is finding available reward seats. Airlines release a limited number of seats on each flight for points bookings, and they can disappear quickly — especially in premium cabins. Here's how to find them.

**Understanding reward seat types**

There are generally two types of reward seats:

- **Classic/standard rewards:** Fixed points pricing, limited availability. These are what you want — they offer the best value.
- **Any seat rewards / Points Plus Pay:** Variable pricing based on the cash fare. Available on any flight with seats, but usually poor value. Use these only as a last resort.

**When airlines release reward seats**

Most airlines release reward seats 330–355 days before departure. If you're flexible with dates, searching early gives you the best chance. Additional seats are sometimes released:

- 2–4 weeks before departure (unsold inventory)
- When schedule changes occur (new flights or aircraft swaps)
- Seasonally (airlines release batches for off-peak periods)

**Tools for searching**

- **Qantas.com reward search:** Good for Qantas-operated flights and oneworld partner awards. Search one route at a time; use the calendar view to see availability across a month.
- **Velocity award search:** Shows availability on Virgin Australia and partner airlines.
- **ExpertFlyer:** Third-party tool that searches multiple airlines and lets you set alerts for specific routes and classes. Essential for serious collectors.
- **Google Flights:** While it doesn't show points pricing, it helps you identify which airlines fly your route and when, so you know what to search for.

**Tip:** Set up ExpertFlyer alerts for your desired route and cabin class. Availability changes constantly as passengers cancel, and alerts ensure you never miss an opening.

**Flexibility is king**

The more flexible you are, the more likely you are to find award seats:

- **Date flexibility:** Even shifting by a day or two can make the difference between zero availability and two seats.
- **Route flexibility:** Can you fly into a different airport? Sydney instead of Melbourne? Bangkok instead of Singapore?
- **Airline flexibility:** If Qantas is sold out, check whether partner airlines like Cathay Pacific or Qatar Airways have availability on similar routes.

**Setting alerts**

If you can't find availability for your preferred dates, set up alerts using ExpertFlyer or check back regularly. Availability changes constantly as passengers cancel or airlines adjust inventory. Check weekly, and increase frequency as your travel date approaches.

**The sweet spot: off-peak and shoulder seasons**

The easiest time to find premium cabin reward seats is during shoulder season (April–May, September–October for most destinations). Avoid school holidays, Christmas/New Year, and major events unless you're searching very early.`,
      },
      {
        id: 'booking-first-reward',
        title: 'Booking Your First Reward Flight',
        durationMinutes: 4,
        askPerryPrompt: 'I want to book my first reward flight. Can you walk me through it?',
        askPerryPrompts: [
          'Walk me through booking a reward flight',
          'What fees should I expect on a reward booking?',
          'Can I earn status credits on reward flights?',
        ],
        content: `You've earned the points, you've found availability — now it's time to book your first reward flight. Here's a step-by-step walkthrough to make sure everything goes smoothly.

**Step 1: Confirm your points balance**

Before you start the booking process, verify that you have enough points in the correct program. If you need to transfer points from a credit card rewards program, do this first and wait for them to arrive (usually instant to 24 hours). Don't start booking until the points are in your frequent flyer account.

**Step 2: Double-check availability**

Reward seat availability can change between when you searched and when you book. Start the booking process as soon as you're ready. If you're booking a partner airline award (e.g., using Qantas Points on a Cathay Pacific flight), availability can be particularly volatile.

**Step 3: Understand taxes and fees**

Reward flights aren't completely free. You'll pay taxes, fees, and carrier charges. These vary enormously:

- **Domestic flights:** Usually $20–60 in taxes and fees
- **International economy:** $50–200 depending on route and airline
- **International business with some carriers:** Can be $200–800+ (British Airways and other carriers with high fuel surcharges)

Check the total cost before confirming. Some airlines have much lower fees than others for the same route.

**Step 4: Complete the booking**

Log in to your frequent flyer account, select the reward flight, enter passenger details, and confirm. Key things to check:

- Correct dates and flight numbers
- Passenger names match passport exactly
- Contact details are correct for flight notifications
- You understand the cancellation and change policies

**Step 5: Add your frequent flyer number**

Even on reward flights, make sure your frequent flyer number is on the booking. Some programs award status credits on reward flights (Qantas does for Classic Reward flights on Qantas-operated services).

**Step 6: Select seats and manage your booking**

After booking, go to "Manage Booking" to select your preferred seat. For Business Class, this is especially important — some seats are significantly better than others. Research your specific aircraft and seat configuration using SeatGuru or similar sites.

**Step 7: Cancellation and changes**

Know the rules before you book:

- **Qantas:** Classic Rewards can be cancelled for a fee (varies by timing). Changes to dates/times may be possible for a fee.
- **Velocity:** Reward flights can be cancelled or changed for a fee, with full points refund.

Pro tip: If you need to cancel, do it as early as possible. Some programs charge higher fees for last-minute cancellations, and you want your points back in your account for the next booking.`,
      },
      {
        id: 'sweet-spots',
        title: 'Best Redemption Sweet Spots',
        durationMinutes: 5,
        askPerryPrompt: 'What are the best value sweet spot redemptions I should target?',
        askPerryPrompts: [
          'What are the best sweet spot redemptions?',
          'Which Business Class gives the best value?',
          'How do upgrade rewards compare to full bookings?',
        ],
        content: `Sweet spots are redemptions where the points required are disproportionately low compared to the cash value of the flight or experience. These are the bookings that experienced collectors target because they deliver outsized value.

**Qantas Classic Rewards — top sweet spots**

**Asia Business Class (80,000 points one-way):** Fly Qantas Business Class to Singapore, Hong Kong, or Tokyo. Cash prices often exceed $4,000 one-way, giving you 5+ cents per point value. The Qantas A330 and 787 Business Class products are excellent.

**Partner Business Class to Europe (128,000 points one-way):** Use Qantas Points to book Qatar Airways Qsuites (often rated the world's best Business Class) from Australia to Europe via Doha. The cash price for Qsuites regularly exceeds $8,000 — that's over 6 cents per point.

**Trans-Tasman in Business (36,000 points one-way):** Australia to New Zealand in Business Class is a reliable sweet spot. Cash fares hover around $1,000–1,500, and availability is generally good.

**Velocity Rewards — top sweet spots**

**Singapore Airlines Business Class (65,500 points one-way to Singapore):** Among the world's best Business Class products on the A380 or 787-10. Cash price often $3,500+, delivering over 5 cpp.

**Short domestic hops (7,800 points one-way):** Short flights like Sydney–Melbourne or Brisbane–Sydney are just 7,800 Velocity Points. When cash fares spike to $200+ during peak times, this delivers solid value and is a great way to use a small balance.

**Partner airlines — hidden gems**

**Cathay Pacific via Qantas or Asia Miles:** Cathay's regional Business Class within Asia is excellent value. Hong Kong to Tokyo in Business for 30,000 Asia Miles is a steal when cash fares run $1,500+.

**Upgrades — the value multiplier**

Don't overlook upgrade rewards. If you've booked a discounted economy fare, upgrading to Business Class with points often requires fewer points than booking the full Business Class reward, and the incremental value is enormous. Qantas offers upgrade rewards starting from 14,000 points on domestic routes.

**Timing your redemptions for maximum value**

- **Book premium cabins when cash prices peak:** Christmas, school holidays, and business travel periods are when Business Class cash fares are highest — but the points price stays the same.
- **Book economy when cash fares are low:** If economy is $200 cash and 16,000 points, pay cash and save your points for a premium redemption.
- **Target new routes:** When airlines launch new routes, they often release generous reward seat availability to fill planes. Watch for route announcements from Qantas, Virgin Australia, and their partners.

**Tip:** Keep an eye on airline route launches — new routes often have generous reward seat availability as airlines try to fill planes in the early months.

**The portfolio approach**

The most successful points collectors don't lock themselves into one program. They maintain balances across 2–3 programs and choose the one offering the best value for each specific trip. Flexibility across programs is the ultimate sweet spot strategy.`,
      },
    ],
  },
];
