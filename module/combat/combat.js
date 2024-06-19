export class ExaltedCombat extends Combat {
    async resetTurnsTaken() {
      const updates = this.combatants.map(c => {
        return {
          _id: c.id,
          [`flags.acted`]: c.isDefeated
            ? true
            : false,
        };
      });
      return this.updateEmbeddedDocuments("Combatant", updates);
    }
  
    async _preCreate(...[data, options, user]) {
      this.turn = null;
      return super._preCreate(data, options, user);
    }
  
    async startCombat() {
      await this.resetTurnsTaken();
      return this.update({ round: 1, turn: null });
    }
  
    async setInitiative(id, value, crasherId = null) {
      const combatant = this.combatants.get(id, { strict: true });
      const newVal = {
        initiative: value
      };
      if (value <= 0 && combatant.initiative && combatant.initiative > 0 && crasherId) {
        newVal[`flags.crashedBy`] = crasherId;
      }
      if (value > 0) {
        newVal[`flags.crashedBy`] = null;
        if(combatant.initiative !== null && combatant.initiative <= 0) {
          newVal[`flags.crashRecovery`] = 2;
        }
      }
      await combatant.update(newVal);
    }
  
    // _sortCombatants(a,b) {
    //   const ia = (Number.isNumeric(a.initiative) && !a.flags.acted) ? a.initiative : -Infinity;
    //   const ib = (Number.isNumeric(b.initiative) && !b.flags.acted) ? b.initiative : -Infinity;
    //   return (ib - ia) || (a.id > b.id ? 1 : -1);
    // }
  
    async nextRound() {
      await this.resetTurnsTaken();
      let advanceTime = Math.max(this.turns.length - (this.turn || 0), 0) * CONFIG.time.turnTime;
      advanceTime += CONFIG.time.roundTime;
      return this.update({ round: this.round + 1, turn: null }, { advanceTime });
    }
  
    // Foundry's combat.turn keeps jumping arround the place so this is unusable
    // async nextTurn() {
    //   let round = this.round;
    //   const currentPerson = this.turns[this.turn];
    //   if(!currentPerson.flags.acted) {
    //     await this.toggleTurnOver(currentPerson.id);
    //   }
    //   const nextTurn = this.turns.filter(t => t.flags.acted === false && t.initiative !== undefined).sort((a, b) => {
    //     return a.initiative > b.initiative ? 1 : -1;
    //   });
    //   if(nextTurn.length === 0) {
    //     return this.nextRound();
    //   }
    //   const updateData = {round, turn: 0};
    //   const updateOptions = {advanceTime: CONFIG.time.turnTime, direction: 1};
    //   // Hooks.callAll("combatTurn", this, updateData, updateOptions);
    //   return this.update(updateData, updateOptions);
    // }
  
    async previousRound() {
      await this.resetTurnsTaken();
      const round = Math.max(this.round - 1, 0);
      let advanceTime = 0;
      if (round > 0)
        advanceTime -= CONFIG.time.roundTime;
      return this.update({ round, turn: null }, { advanceTime });
    }
  
    async resetAll() {
      await this.resetTurnsTaken();
      this.combatants.forEach(c => c.updateSource({ initiative: null }));
      return this.update({ turn: null, combatants: this.combatants.toObject() }, { diff: false });
    }
  
    async toggleTurnOver(id) {
      const combatant = this.getEmbeddedDocument("Combatant", id);
      await combatant?.toggleCombatantTurnOver();
      return this.setCharacterTurn(id);
      // return this.nextTurn();
    }
  
    async setCharacterTurn(id) {
      const turn = this.turns.findIndex(t => t.id === id);
      return this.update({ turn });
      // return this.nextTurn();
    }
  
    async rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt) {
      const combatant = this.combatants.get(ids[0]);
      if (combatant.token.actor) {
        combatant.token.actor.actionRoll(
          {
            rollType: 'joinBattle',
            pool: 'joinbattle'
          }
        );
      }
      else {
        super.rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt);
      }
    }
  
    async rollAll(options) {
      const ids = this.combatants.reduce((ids, c) => {
        if (c.isOwner && (c.initiative === null)) ids.push(c.id);
        return ids;
      }, []);
      await super.rollInitiative(ids, options);
      return this.update({ turn: null });
    }
  
    async rollNPC(options = {}) {
      const ids = this.combatants.reduce((ids, c) => {
        if (c.isOwner && c.isNPC && (c.initiative === null)) ids.push(c.id);
        return ids;
      }, []);
      await super.rollInitiative(ids, options);
      return this.update({ turn: null });
    }
  } 